const fs = require("fs");

const getAllResults = require("./Search_Permits/search.js");
const fetchNewPermits = require("./utils/fetchPermits.js");
const uploadFolder = require("./db/upload.js");
const cleanJsonFiles = require("./utils/cleaner.js");

const cleanupFolders = require("./utils/deleteFolders.js");

const statusIds = JSON.parse(
  fs.readFileSync("./Search_Permits/status_ids.json", "utf8"),
);

const secondaryIds = JSON.parse(
  fs.readFileSync("./Search_Permits/secondary.data.json", "utf8"),
);

function getStatusByName(jsonData, targetName) {
  return jsonData.Result?.find((item) => item.Name === targetName) || null;
}

function getSecondaryDataByName(jsonData, targetName) {
  return (
    jsonData.Result?.CaseTypes?.find(
      (item) => item.CaseTypeName === targetName,
    ) || null
  );
}

const requiredStatues = [
  //"Issued",
  // "In Review",
  "On Hold",
  // "Pending Approval",
  // "Submitted",
];
//aprroved , in review , issued , on hold , stop work order , submitted

const requiredSecondaryData = [
  "Residential - New One- and Two-Family Dwelling",
  // "Commercial New Multi Family",
  //"Commercial New Building or Addition",
  // "Residential Addition",
];

function getDateDaysAgo(offset = 1) {
  const date = new Date();
  date.setDate(date.getDate() - offset); // deafault is 1 , yesterday
  date.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC
  console.log("Applied from date :", date.toISOString().split("T")[0]);
  return date.toISOString();
}

const payload = {
  Keyword: "",
  ExactMatch: true,
  SearchModule: 2,
  FilterModule: 1,
  SearchMainAddress: false,
  PlanCriteria: {
    PlanNumber: null,
    PlanTypeId: null,
    PlanWorkclassId: null,
    PlanStatusId: null,
    ProjectName: null,
    ApplyDateFrom: null,
    ApplyDateTo: null,
    ExpireDateFrom: null,
    ExpireDateTo: null,
    CompleteDateFrom: null,
    CompleteDateTo: null,
    Address: null,
    Description: null,
    SearchMainAddress: false,
    ContactId: null,
    ParcelNumber: null,
    TypeId: null,
    WorkClassIds: null,
    ExcludeCases: null,
    EnableDescriptionSearch: false,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  PermitCriteria: {
    PermitNumber: null,
    PermitTypeId:
      "3921e2e6-5d4b-4aad-89b3-212319bf789e_0b63d11c-11a2-481f-94e2-bc312dedb337", // Residential - New One- and Two-Family Dwelling
    PermitWorkclassId: null,
    PermitStatusId: "f8b6324d-f3b0-4efc-be19-e171ae0410d4", //code for issued
    ProjectName: null,
    IssueDateFrom: null,
    IssueDateTo: null,
    Address: null,
    Description: null,
    ExpireDateFrom: null,
    ExpireDateTo: null,
    FinalDateFrom: null,
    FinalDateTo: null,
    ApplyDateFrom: "2024-12-30T18:30:00.000Z", // apply from december 2024
    ApplyDateTo: null,
    SearchMainAddress: false,
    ContactId: null,
    TypeId: null,
    WorkClassIds: null,
    ParcelNumber: null,
    ExcludeCases: null,
    EnableDescriptionSearch: false,
    PageNumber: 1, // page indexing starts from 1
    PageSize: 200, //
    SortBy: "IssueDate",
    SortAscending: false,
  },
  InspectionCriteria: {
    Keyword: null,
    ExactMatch: false,
    Complete: null,
    InspectionNumber: null,
    InspectionTypeId: null,
    InspectionStatusId: null,
    RequestDateFrom: null,
    RequestDateTo: null,
    ScheduleDateFrom: null,
    ScheduleDateTo: null,
    Address: null,
    SearchMainAddress: false,
    ContactId: null,
    TypeId: [],
    WorkClassIds: [],
    ParcelNumber: null,
    DisplayCodeInspections: false,
    ExcludeCases: [],
    ExcludeFilterModules: [],
    HiddenInspectionTypeIDs: null,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  CodeCaseCriteria: {
    CodeCaseNumber: null,
    CodeCaseTypeId: null,
    CodeCaseStatusId: null,
    ProjectName: null,
    OpenedDateFrom: null,
    OpenedDateTo: null,
    ClosedDateFrom: null,
    ClosedDateTo: null,
    Address: null,
    ParcelNumber: null,
    Description: null,
    SearchMainAddress: false,
    RequestId: null,
    ExcludeCases: null,
    ContactId: null,
    EnableDescriptionSearch: false,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  RequestCriteria: {
    RequestNumber: null,
    RequestTypeId: null,
    RequestStatusId: null,
    ProjectName: null,
    EnteredDateFrom: null,
    EnteredDateTo: null,
    DeadlineDateFrom: null,
    DeadlineDateTo: null,
    CompleteDateFrom: null,
    CompleteDateTo: null,
    Address: null,
    ParcelNumber: null,
    SearchMainAddress: false,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  BusinessLicenseCriteria: {
    LicenseNumber: null,
    LicenseTypeId: null,
    LicenseClassId: null,
    LicenseStatusId: null,
    BusinessStatusId: null,
    LicenseYear: null,
    ApplicationDateFrom: null,
    ApplicationDateTo: null,
    IssueDateFrom: null,
    IssueDateTo: null,
    ExpirationDateFrom: null,
    ExpirationDateTo: null,
    SearchMainAddress: false,
    CompanyTypeId: null,
    CompanyName: null,
    BusinessTypeId: null,
    Description: null,
    CompanyOpenedDateFrom: null,
    CompanyOpenedDateTo: null,
    CompanyClosedDateFrom: null,
    CompanyClosedDateTo: null,
    LastAuditDateFrom: null,
    LastAuditDateTo: null,
    ParcelNumber: null,
    Address: null,
    TaxID: null,
    DBA: null,
    ExcludeCases: null,
    TypeId: null,
    WorkClassIds: null,
    ContactId: null,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  ProfessionalLicenseCriteria: {
    LicenseNumber: null,
    HolderFirstName: null,
    HolderMiddleName: null,
    HolderLastName: null,
    HolderCompanyName: null,
    LicenseTypeId: null,
    LicenseClassId: null,
    LicenseStatusId: null,
    IssueDateFrom: null,
    IssueDateTo: null,
    ExpirationDateFrom: null,
    ExpirationDateTo: null,
    ApplicationDateFrom: null,
    ApplicationDateTo: null,
    Address: null,
    MainParcel: null,
    SearchMainAddress: false,
    ExcludeCases: null,
    TypeId: null,
    WorkClassIds: null,
    ContactId: null,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  LicenseCriteria: {
    LicenseNumber: null,
    LicenseTypeId: null,
    LicenseClassId: null,
    LicenseStatusId: null,
    BusinessStatusId: null,
    ApplicationDateFrom: null,
    ApplicationDateTo: null,
    IssueDateFrom: null,
    IssueDateTo: null,
    ExpirationDateFrom: null,
    ExpirationDateTo: null,
    SearchMainAddress: false,
    CompanyTypeId: null,
    CompanyName: null,
    BusinessTypeId: null,
    Description: null,
    CompanyOpenedDateFrom: null,
    CompanyOpenedDateTo: null,
    CompanyClosedDateFrom: null,
    CompanyClosedDateTo: null,
    LastAuditDateFrom: null,
    LastAuditDateTo: null,
    ParcelNumber: null,
    Address: null,
    TaxID: null,
    DBA: null,
    ExcludeCases: null,
    TypeId: null,
    WorkClassIds: null,
    ContactId: null,
    HolderFirstName: null,
    HolderMiddleName: null,
    HolderLastName: null,
    MainParcel: null,
    EnableDescriptionSearchForBLicense: false,
    EnableDescriptionSearchForPLicense: false,
    EnableDescriptionSearchForOperationalPermit: false,
    IsOperationalPermit: false,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  ProjectCriteria: {
    ProjectNumber: null,
    ProjectName: null,
    Address: null,
    ParcelNumber: null,
    StartDateFrom: null,
    StartDateTo: null,
    ExpectedEndDateFrom: null,
    ExpectedEndDateTo: null,
    CompleteDateFrom: null,
    CompleteDateTo: null,
    Description: null,
    SearchMainAddress: false,
    ContactId: null,
    TypeId: null,
    ExcludeCases: null,
    EnableDescriptionSearch: false,
    PageNumber: 0,
    PageSize: 0,
    SortBy: null,
    SortAscending: false,
  },
  PlanSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "PlanNumber.keyword",
      Value: "Plan Number",
    },
    {
      Key: "ProjectName.keyword",
      Value: "Project",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
    {
      Key: "ApplyDate",
      Value: "Apply Date",
    },
  ],
  PermitSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "PermitNumber.keyword",
      Value: "Permit Number",
    },
    {
      Key: "ProjectName.keyword",
      Value: "Project",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
    {
      Key: "IssueDate",
      Value: "Issued Date",
    },
    {
      Key: "FinalDate",
      Value: "Finalized Date",
    },
  ],
  InspectionSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "InspectionNumber.keyword",
      Value: "Inspection Number",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
    {
      Key: "ScheduledDate",
      Value: "Schedule Date",
    },
    {
      Key: "RequestDate",
      Value: "Request Date",
    },
  ],
  CodeCaseSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "CaseNumber.keyword",
      Value: "Code Case Number",
    },
    {
      Key: "ProjectName.keyword",
      Value: "Project",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
    {
      Key: "OpenedDate",
      Value: "Opened Date",
    },
    {
      Key: "ClosedDate",
      Value: "Closed Date",
    },
  ],
  RequestSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "RequestNumber.keyword",
      Value: "Request Number",
    },
    {
      Key: "ProjectName.keyword",
      Value: "Project Name",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
    {
      Key: "EnteredDate",
      Value: "Date Entered",
    },
    {
      Key: "CompleteDate",
      Value: "Completion Date",
    },
  ],
  LicenseSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "LicenseNumber.keyword",
      Value: "License Number",
    },
    {
      Key: "LicenseNumber.keyword",
      Value: "Operational Permit Number",
    },
    {
      Key: "CompanyName.keyword",
      Value: "Company Name",
    },
    {
      Key: "AppliedDate",
      Value: "Applied Date",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
  ],
  ProjectSortList: [
    {
      Key: "relevance",
      Value: "Relevance",
    },
    {
      Key: "ProjectNumber.keyword",
      Value: "Project Number",
    },
    {
      Key: "ProjectName.keyword",
      Value: "Project Name",
    },
    {
      Key: "StartDate",
      Value: "Start Date",
    },
    {
      Key: "CompleteDate",
      Value: "Completed Date",
    },
    {
      Key: "ExpectedEndDate",
      Value: "Expected End Date",
    },
    {
      Key: "MainAddress",
      Value: "Address",
    },
  ],
  ExcludeCases: null,
  SortOrderList: [
    {
      Key: true,
      Value: "Ascending",
    },
    {
      Key: false,
      Value: "Descending",
    },
  ],
  HiddenInspectionTypeIDs: null,
  PageNumber: 0,
  PageSize: 0,
  SortBy: "IssueDate",
  SortAscending: false,
};

async function getResultsforStatues(second) {
  payload.PermitCriteria.PermitTypeId = second;
  console.log("Secondary data", second);
  //need to delete daily permits or it will just append to the older file
  fs.rmSync("./daily_permits.json", { force: true });

  for (const status of requiredStatues) {
    const statusObj = getStatusByName(statusIds, status);

    payload.PermitCriteria.PermitStatusId = statusObj.PermitStatusId;

    console.log("Getting for status :", statusObj.Name);

    payload.PermitCriteria.IssueDateFrom = getDateDaysAgo(16); // 2 days ago
    // console.log(getDateDaysAgo(15));

    await getAllResults(payload, statusObj.Name, "daily_permits.json"); // creates file
  }

  // if no results are there then no daily_permits.json file will be formed , so need to handle that edgecase
  if (!fs.existsSync("daily_permits.json")) {
    return;
  }

  // get info
  await fetchNewPermits("daily_permits.json", "daily_permits");
  //clean

  await cleanJsonFiles("daily_permits", "cleaned_daily_permits");
  //push to db
  await uploadFolder("cleaned_daily_permits");

  // uncomment later
  await cleanupFolders(["cleaned_daily_permits", "daily_permits"]);
}

// getResultsforStatues();

async function main() {
  for (const second of requiredSecondaryData) {
    const data = getSecondaryDataByName(secondaryIds, second);
    console.log(data.CaseTypeId);
    await getResultsforStatues(data.CaseTypeId);
  }
  console.log("All done");
}

main();
