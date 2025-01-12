import fs from 'fs';
import path from 'path';

class PushPackage {
  constructor(websitePushID, websiteJson) {
    this.websitePushID = websitePushID;
    this.websiteJson = websiteJson;
  }

  // Minimal implementation just returns the website.json
  async create() {
    return {
      websiteName: this.websiteJson.websiteName,
      websitePushID: this.websitePushID,
      allowedDomains: this.websiteJson.allowedDomains,
      urlFormatString: this.websiteJson.urlFormatString,
      webServiceURL: this.websiteJson.webServiceURL
    };
  }
}

export default PushPackage; 