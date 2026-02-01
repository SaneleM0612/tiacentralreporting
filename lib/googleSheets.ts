import { TeamMember, RGMSubmission, MAUSubmission, Role, Region, Cluster, OnboardEntry } from '../types';

// =========================================================================================
// INSTRUCTIONS FOR GOOGLE SHEETS BACKEND
// =========================================================================================
// 1. Create a Google Sheet with 5 tabs: "member_details", "rgm_submissions", "mau_submission", "onboards", "onboard_cc".
// 2. Open Extensions > Apps Script.
// 3. Paste the code below into Code.gs (Delete existing code).
// 4. Deploy > New Deployment > Select "Web App".
// 5. Description: "API V8 (BA-LT Stats & Isolation)", Execute as: "Me", Who has access: "Anyone".
// 6. Click Deploy. 
// 7. COPY THE NEW URL if it changed, and paste it into GOOGLE_SCRIPT_URL below.

/* 
// --- GOOGLE APPS SCRIPT CODE START ---

const SHEETS = {
  MEMBERS: "member_details",
  RGM: "rgm_submissions",
  MAU: "mau_submission",
  ONBOARDS: "onboards",
  ONBOARD_CC: "onboard_cc"
};

const TIMEZONE = "GMT+2"; // South African Standard Time

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return errorResponse("Server is busy, please try again.");
  }
  
  try {
    const params = e.parameter || {};
    let postData = {};
    if (e.postData && e.postData.contents) {
        try {
            postData = JSON.parse(e.postData.contents);
        } catch (err) {
            postData = {};
        }
    }
    
    const action = params.action || postData.action;
    let result = {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const ensureHeaders = (sheet, type) => {
      if (sheet.getLastRow() === 0) {
        let headers = [];
        if (type === 'MEMBERS') {
          headers = ["MSISDN", "Full Name", "Role", "Region", "Cluster", "Momo Number", "Created At"];
        } else if (type === 'SUBMISSIONS') {
          // V7 Schema: Added Team Member MSISDN at index 12 for strict ownership tracking
          headers = [
            "id", "created_at", "submission_date", "Role", "agent_name", 
            "team_member_name", "region", "Cluster", "Momo Number", 
            "agent_msisdn", "transaction_id", "Category", "Team Member MSISDN"
          ];
        } else if (type === 'ONBOARDS') {
          // V5 Schema: Added Submitter at index 16
          headers = [
            "id", "created_at", "Channel", "Type", "Name", "Msisdn", "Contact no", "ID", 
            "Physical Address", "Cluster", "Areas Mentor/RTL", "Leader", 
            "Leader Msisdn", "Onboarded date", "AML score", "Mainplace", "Submitter"
          ];
        }
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
        SpreadsheetApp.flush();
      }
    }

    if (action === 'getUser') {
      const msisdn = params.msisdn;
      const sheet = ss.getSheetByName(SHEETS.MEMBERS);
      if (!sheet) return errorResponse("Sheet 'member_details' not found");
      
      if (sheet.getLastRow() > 0) {
        const data = sheet.getDataRange().getValues();
        const userRow = data.slice(1).find(r => String(r[0]) === String(msisdn)); 
        
        if (userRow) {
          result = {
            data: {
              msisdn: String(userRow[0]),
              fullName: userRow[1],
              role: userRow[2],
              region: userRow[3],
              cluster: userRow[4],
              momoNumber: String(userRow[5])
            }
          };
        } else {
          result = { error: 'User not found', code: 'PGRST116' };
        }
      } else {
         result = { error: 'User not found', code: 'PGRST116' };
      }
    } 
    
    else if (action === 'createUser') {
      const sheet = ss.getSheetByName(SHEETS.MEMBERS);
      if (!sheet) return errorResponse("Sheet 'member_details' not found");
      ensureHeaders(sheet, 'MEMBERS');

      const data = sheet.getDataRange().getValues();
      let exists = false;
      if (data.length > 1) {
          exists = data.slice(1).some(r => String(r[0]) === String(postData.msisdn));
      }
      
      if (exists) {
        result = { error: 'User already exists' };
      } else {
        const timestamp = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
        sheet.appendRow([
          postData.msisdn,
          postData.fullName,
          postData.role,
          postData.region,
          postData.cluster,
          postData.momoNumber,
          timestamp
        ]);
        result = { success: true };
      }
    }

    else if (action === 'checkDuplicates') {
      const type = postData.type; 
      const sheetName = type === 'RGM' ? SHEETS.RGM : SHEETS.MAU;
      const idsToCheck = postData.ids || [];
      const sheet = ss.getSheetByName(sheetName);
      
      if (sheet && sheet.getLastRow() > 1) {
        const data = sheet.getDataRange().getValues();
        const existingIds = new Set(data.slice(1).map(r => String(r[10])));
        const duplicates = idsToCheck.filter(id => existingIds.has(String(id)));
        result = { duplicates: duplicates };
      } else {
        result = { duplicates: [] };
      }
    }

    else if (action === 'submitBatch') {
      const type = postData.type;
      const sheetName = type === 'RGM' ? SHEETS.RGM : SHEETS.MAU;
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return errorResponse(`Sheet '${sheetName}' not found`);
      ensureHeaders(sheet, 'SUBMISSIONS');

      const rows = postData.rows;
      const now = new Date();
      const created_at = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
      
      const newRows = rows.map(r => {
        const subDate = r.submission_date ? Utilities.formatDate(new Date(r.submission_date), TIMEZONE, "yyyy-MM-dd HH:mm:ss") : created_at;
        return [
          Utilities.getUuid(),
          created_at,
          subDate,
          r.role,
          r.agent_name,
          r.team_member_name,
          r.region,
          r.cluster,
          r.momo_number,
          r.agent_msisdn,
          r.transaction_id,
          r.category || "",
          r.team_member_msisdn || "" 
        ];
      });
      
      if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
      }
      result = { success: true };
    }

    else if (action === 'submitOnboard') {
       const entry = postData.entry;
       const isCriminalCheck = entry.type === "Criminal Check";
       const targetSheetName = isCriminalCheck ? SHEETS.ONBOARD_CC : SHEETS.ONBOARDS;
       const sheet = ss.getSheetByName(targetSheetName);
       if (!sheet) return errorResponse(`Sheet '${targetSheetName}' not found`);
       
       ensureHeaders(sheet, 'ONBOARDS');

       if (entry.originalSheet === 'CC' && !isCriminalCheck) {
          const oldSheet = ss.getSheetByName(SHEETS.ONBOARD_CC);
          if (oldSheet && oldSheet.getLastRow() > 1) {
             const data = oldSheet.getDataRange().getValues();
             const index = data.findIndex(r => String(r[0]) === String(entry.id));
             if (index > -1) oldSheet.deleteRow(index + 1);
          }
       }
       
       const now = new Date();
       const created_at = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
       const id = entry.id || Utilities.getUuid();
       
       const rowData = [
         id, created_at, entry.channel || "Spaza", entry.type, entry.name, entry.msisdn, 
         entry.contactNo, entry.idNumber, entry.physicalAddress, entry.cluster, 
         entry.areaMentorRtl, entry.leaderName, entry.leaderMsisdn, entry.onboardedDate, 
         entry.amlScore, entry.mainplace, entry.submitterMsisdn || ""
       ];
       
       let updated = false;
       if (entry.id) {
          const data = sheet.getDataRange().getValues();
          const rowIndex = data.findIndex(r => String(r[0]) === String(entry.id));
          if (rowIndex > 0) {
             sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
             updated = true;
          }
       }
       
       if (!updated) {
          sheet.appendRow(rowData);
       }
       
       result = { success: true };
    }

    else if (action === 'getOnboards') {
       const sheetType = params.sheetType; 
       const userMsisdn = params.msisdn;
       
       if (!userMsisdn) {
         return errorResponse("Access Denied: Missing User Identity");
       }

       const sheetName = sheetType === 'CC' ? SHEETS.ONBOARD_CC : SHEETS.ONBOARDS;
       const sheet = ss.getSheetByName(sheetName);
       
       let onboardData = [];
       if (sheet && sheet.getLastRow() > 1) {
         const data = sheet.getDataRange().getValues();
         // Filter by Submitter (Index 16) for strict isolation
         const rows = data.slice(1).filter(r => String(r[16]) === String(userMsisdn));
         rows.sort((a, b) => new Date(b[1]) - new Date(a[1]));
         
         onboardData = rows.map(r => ({
           id: r[0], created_at: r[1], channel: r[2], type: r[3], name: r[4], 
           msisdn: r[5], contactNo: r[6], idNumber: r[7], physicalAddress: r[8], 
           cluster: r[9], areaMentorRtl: r[10], leaderName: r[11], leaderMsisdn: r[12], 
           onboardedDate: r[13], amlScore: r[14], mainplace: r[15], submitterMsisdn: r[16], 
           originalSheet: sheetType
         }));
       }
       result = { data: onboardData };
    }

    else if (action === 'getStats') {
       // 'identifier' is strictly the user's MSISDN
       const identifier = params.identifier; 
       const start = new Date(params.startDate).getTime();
       const end = new Date(params.endDate).getTime();
       
       // Helper for RGM/MAU sheets (checks index 12 for Team Member MSISDN)
       const countSubmissions = (sheetName) => {
         const sheet = ss.getSheetByName(sheetName);
         if (!sheet || sheet.getLastRow() <= 1) return 0;
         const data = sheet.getDataRange().getValues();
         
         let count = 0;
         for (let i = 1; i < data.length; i++) {
            const r = data[i];
            const recordMsisdn = String(r[12] || ""); 
            // Fallback for very old data only if necessary, but prioritizing strict MSISDN match
            const recordMomo = String(r[8] || ""); 

            // Strict isolation: Only count if MSISDN matches.
            // If data is old and lacks MSISDN column, it won't be counted for security, 
            // or we could fallback to momo, but strict MSISDN is safer.
            if (recordMsisdn === String(identifier)) {
               const rDateStr = r[1];
               if (rDateStr) {
                  const rDate = new Date(rDateStr).getTime();
                  if (rDate >= start && rDate <= end) {
                     count++;
                  }
               }
            }
         }
         return count;
       };

       // Helper for Onboarding sheets (checks index 16 for Submitter MSISDN)
       const countOnboards = (sheetName) => {
         const sheet = ss.getSheetByName(sheetName);
         if (!sheet || sheet.getLastRow() <= 1) return 0;
         const data = sheet.getDataRange().getValues();
         
         let count = 0;
         for (let i = 1; i < data.length; i++) {
            const r = data[i];
            const submitterMsisdn = String(r[16] || "");
            
            if (submitterMsisdn === String(identifier)) {
               const rDateStr = r[1];
               if (rDateStr) {
                  const rDate = new Date(rDateStr).getTime();
                  if (rDate >= start && rDate <= end) {
                     count++;
                  }
               }
            }
         }
         return count;
       };
       
       result = {
         rgmCount: countSubmissions(SHEETS.RGM),
         mauCount: countSubmissions(SHEETS.MAU),
         onboardCount: countOnboards(SHEETS.ONBOARDS),
         ccCount: countOnboards(SHEETS.ONBOARD_CC)
       };
    }

    else if (action === 'getReport') {
      const type = params.type;
      const start = new Date(params.startDate).getTime();
      const end = new Date(params.endDate).getTime();
      const sheetName = type === 'RGM' ? SHEETS.RGM : SHEETS.MAU;
      const sheet = ss.getSheetByName(sheetName);
      
      let reportData = [];
      if (sheet && sheet.getLastRow() > 1) {
         const data = sheet.getDataRange().getValues();
         const filtered = data.slice(1).filter(r => {
            const rDateStr = r[1];
            if (!rDateStr) return false;
            const rDate = new Date(rDateStr).getTime();
            return rDate >= start && rDate <= end;
         });
         
         reportData = filtered.map(r => ({
           id: r[0], created_at: r[1], submission_date: r[2], role: r[3], 
           agent_name: r[4], team_member_name: r[5], region: r[6], cluster: r[7], 
           momo_number: r[8], agent_msisdn: r[9], transaction_id: r[10], category: r[11] || ""
         }));
      }
      result = { data: reportData };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return errorResponse(e.toString());
  } finally {
    lock.releaseLock();
  }
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- GOOGLE APPS SCRIPT CODE END ---
*/

// Updated with the URL provided
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkzUSrOKuxbHyOEe5sSt0S1o_Le913e3HEluW1kwBe-cw42zNLSXgkkbg8QQ3QEUC_8w/exec';

const handleResponse = async (response: Response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Invalid JSON from Server:", text);
        return { error: `Server Error: ${text.substring(0, 100)}` };
    }
};

export const sheetsApi = {
    getUser: async (msisdn: string) => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUser&msisdn=${msisdn}`);
            return await handleResponse(response);
        } catch (e: any) {
            console.error("Network/Fetch Error:", e);
            return { error: e.message || "Network Error" };
        }
    },

    createUser: async (user: any) => {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'createUser', ...user })
            });
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    },

    checkTransactionDuplicates: async (ids: string[], type: 'RGM' | 'MAU') => {
         try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'checkDuplicates', ids, type })
            });
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    },

    submitBatch: async (rows: any[], type: 'RGM' | 'MAU') => {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'submitBatch', rows, type })
            });
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    },

    submitOnboard: async (entry: OnboardEntry) => {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: 'submitOnboard', entry })
            });
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    },

    getOnboards: async (sheetType: 'CC' | 'Regular', msisdn: string) => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getOnboards&sheetType=${sheetType}&msisdn=${msisdn}&_t=${Date.now()}`);
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    },

    getMonthlyStats: async (identifier: string, startDate: string, endDate: string) => {
         try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getStats&identifier=${identifier}&startDate=${startDate}&endDate=${endDate}`);
            return await handleResponse(response);
        } catch (e) {
            console.error(e);
            return { rgmCount: 0, mauCount: 0, onboardCount: 0, ccCount: 0 };
        }
    },

    getReportData: async (type: 'RGM' | 'MAU', startDate: string, endDate: string) => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getReport&type=${type}&startDate=${startDate}&endDate=${endDate}`);
            return await handleResponse(response);
        } catch (e: any) {
             console.error("Network/Fetch Error:", e);
             return { error: e.message || "Network Error" };
        }
    }
};