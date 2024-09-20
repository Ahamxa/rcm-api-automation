import Joi from 'joi';

// Define the Joi schema
const patientSchema = Joi.object({
  Metadata: Joi.object({
    ApiSender: Joi.string().required(),
    ApiConsumer: Joi.string().required(),
    MessageDateTime: Joi.date().iso().required()
  }).required(),

  Data: Joi.object({
    Patient: Joi.object({
      PatientID: Joi.number().integer().required(),
      PatientEventID: Joi.number().integer().optional(),
      PatientStatus: Joi.string().valid('Active', 'Inactive').required(),
      PatientFirst: Joi.string().min(1).max(50).required(),
      PatientMiddle: Joi.string().allow(null, '').optional(),
      PatientLast: Joi.string().min(1).max(50).required(),
      PatientDOB: Joi.date().iso().required(),
      PatientSSN: Joi.string().pattern(/^\d{9}$/).optional(),
      PatientGender: Joi.string().valid('M', 'F', 'O').required(), // M, F, or O (for Other)
      PatientEthnicity: Joi.array().items(Joi.string()).optional(),
      PatientRace: Joi.array().items(Joi.string()).optional(),

      PatientAddress: Joi.object({
        AddressLine1: Joi.string().min(1).max(100).required(),
        AddressLine2: Joi.string().allow(null, '').optional(),
        City: Joi.string().min(1).max(50).required(),
        State: Joi.string().length(2).required(),
        Zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required()
      }).required(),

      PatientPhone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/).optional(),
      PatientMobilePhone: Joi.string().allow(null, '').optional(),
      PatientFloor: Joi.string().optional(),
      PatientRoom: Joi.string().optional(),
      PatientAdmitDate: Joi.date().iso().required(),

      Facility: Joi.object({
        FacilityName: Joi.string().required(),
        PlaceOfServiceCode: Joi.number().integer().required(),
        NPI: Joi.string().pattern(/^\d{10}$/).required(),
        ExternalID: Joi.string().required(),

        FacilityAddress: Joi.object({
          AddressLine1: Joi.string().min(1).max(100).required(),
          AddressLine2: Joi.string().allow(null, '').optional(),
          City: Joi.string().min(1).max(50).required(),
          State: Joi.string().length(2).required(),
          Zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required()
        }).required()
      }).required(),

      Insurance: Joi.array().items(
        Joi.object({
          InsuranceSetID: Joi.number().integer().required(),
          CompanyName: Joi.string().required(),
          CompanyAddress: Joi.object().optional(), // Could expand based on fields
          SubscriberAddress: Joi.object().optional(), // Could expand based on fields
          InsurancePriority: Joi.string().valid('Primary', 'Secondary', 'Tertiary').required(),
          PolicyNumber: Joi.string().required(),
          SubscriberEmployerAddress: Joi.object().optional() // Could expand based on fields
        })
      ).min(1).required(),

      PatientLanguage: Joi.object({
        LanguageName: Joi.string().required(),
        Code_639_1: Joi.string().length(2).required(),
        Code_639_2: Joi.string().length(3).required()
      }).required(),

      IsACO: Joi.boolean().required(),
      PatientEnrollments: Joi.array().items(Joi.object()).optional(),
      MedicareNumber: Joi.string().optional()
    }).required()
  }).required()
});

export default patientSchema;