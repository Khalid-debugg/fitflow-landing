// License key generation
export {
  generateLicenseKey,
  generateLicenseKeySync,
  verifyChecksum
} from './generate'

// License key validation
export {
  validateLicenseKey,
  validateLicenseKeyFormat,
  calculateDaysRemaining,
  hasUpdateAccess,
  type LicenseValidationResult
} from './validate'
