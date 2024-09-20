import Joi from 'joi';

// Define the Joi schema
const chargeSchema = Joi.object({
  Metadata: Joi.object({
    ApiSender: Joi.string().required(),
    ApiConsumer: Joi.string().required(),
    MessageDateTime: Joi.date().iso().required()
  }).required(),

  Data: Joi.object({
    BillingEvent: Joi.object({
      Patient: Joi.object({
        PatientFirst: Joi.string().min(1).max(50).required(),
        PatientMiddle: Joi.string().allow(null, '').optional(),
        PatientLast: Joi.string().min(1).max(50).required(),
        PatientDOB: Joi.date().iso().required(),
        PatientSSN: Joi.string().pattern(/^\d{9}$/).optional(),
        PatientGender: Joi.string().valid('M', 'F', 'O').required(),

        PatientAddress: Joi.object({
          AddressLine1: Joi.string().min(1).max(100).required(),
          AddressLine2: Joi.string().allow(null, '').optional(),
          City: Joi.string().min(1).max(50).required(),
          State: Joi.string().length(2).required(),
          Zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required()
        }).required(),

        PatientPhone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/).optional(),
        PatientMobilePhone: Joi.string().allow(null, '').optional(),
        IsACO: Joi.boolean().required(),
        PatientEnrollments: Joi.array().items(Joi.object()).optional()
      }).required(),

      BillingEventID: Joi.number().integer().required(),
      PatientID: Joi.number().integer().required(),
      PatientExternalID: Joi.string().required(),
      FacilityID: Joi.number().integer().required(),
      FacilityExternalID: Joi.string().required(),
      PlaceOfServiceCode: Joi.number().integer().required(),
      EncounterID: Joi.number().integer().required(),
      DateOfService: Joi.date().iso().required(),

      Charges: Joi.array().items(
        Joi.object({
          CPT: Joi.string().required(),
          TimeSpent: Joi.number().integer().min(0).required(),
          Units: Joi.number().integer().min(1).required(),
          Modifiers: Joi.array().items(Joi.string().allow(null)).optional(),
          ICD: Joi.array().items(
            Joi.object({
              ICD10: Joi.string().required(),
              Description: Joi.string().required()
            })
          ).min(1).required()
        })
      ).min(1).required(),

      Provider: Joi.object({
        FirstName: Joi.string().required(),
        LastName: Joi.string().required(),
        NPI: Joi.string().pattern(/^\d{10}$/).required(),
        TIN: Joi.string().required(),
        ProviderID: Joi.string().required(),
        ProviderExternalID: Joi.string().required()
      }).required(),

      MedicaidNumber: Joi.string().optional()
    }).required()
  }).required()
});

export default chargeSchema;