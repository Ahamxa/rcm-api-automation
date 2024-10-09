import Joi from 'joi';

// Define the Joi schema
const patientSchema = Joi.object({
  Metadata: Joi.object({
    ApiSender: Joi.string().allow(null, '').required(),
    ApiConsumer: Joi.string().allow(null, '').optional(),
    MessageDateTime: Joi.date().iso().optional(),
  }).required(),

  Data: Joi.object({
    Patient: Joi.object({
      PatientID: Joi.number().integer().required(), // Cannot be empty
      PatientEventID: Joi.number().integer().allow(null, '').optional(),
      PatientStatus: Joi.string().optional(),
      PatientFirst: Joi.string().min(1).max(50).required(),
      PatientMiddle: Joi.string().allow(null, '').optional(),
      PatientLast: Joi.string().min(1).max(50).required(),
      PatientDOB: Joi.date().iso().required(),
      PatientSSN: Joi.string().allow(null, '').optional(),
      PatientGender: Joi.string().pattern(/^.$/).allow(null, '').optional(),
      PatientEthnicity: Joi.array().items().allow(null, '').optional(),
      PatientRace: Joi.array().items().allow(null, '').optional(),

      PatientAddress: Joi.object({
        AddressLine1: Joi.string().min(1).max(100).allow(null, '').optional(),
        AddressLine2: Joi.string().allow(null, '').optional(),
        City: Joi.string().min(1).max(50).allow(null, '').optional(),
        State: Joi.string().length(2).allow(null, '').optional(),
        Zip: Joi.string().allow(null, '').optional()
      }).allow(null, '').optional(),

      PatientPhone: Joi.string().allow(null,'').optional(),
      PatientMobilePhone: Joi.string().allow(null, '').optional(),
      PatientFloor: Joi.string().allow(null, '').optional(),
      PatientRoom: Joi.string().allow(null, '').optional(),
      PatientAdmitDate: Joi.date().iso().allow(null, '').optional(),

      Facility: Joi.object({
        FacilityName: Joi.string().allow(null, '').optional(),
        PlaceOfServiceCode: Joi.number().integer().allow(null, '').optional(),
        NPI: Joi.string().allow(null, '').optional(),
        ExternalID: Joi.string().allow(null, '').optional(),

        FacilityAddress: Joi.object({
          AddressLine1: Joi.string().min(1).max(100).allow(null, '').optional(),
          AddressLine2: Joi.string().allow(null, '').optional(),
          City: Joi.string().min(1).max(50).allow(null, '').optional(),
          State: Joi.string().length(2).allow(null, '').optional(),
          Zip: Joi.string().allow(null, '').optional()
        }).allow(null, '').optional()

      }).allow(null, '').optional(),

      Insurance: Joi.array().items(
        Joi.object({
          InsuranceSetID: Joi.number().integer().required(),
          CompanyName: Joi.string().allow(null, '').optional(),
          CompanyAddress: Joi.object().allow(null, '').optional(),
          SubscriberAddress: Joi.object().allow(null, '').optional(),
          InsurancePriority: Joi.string().allow(null, '').optional(),
          PolicyNumber: Joi.string().allow(null, '').optional(),
          SubscriberEmployerAddress: Joi.object().allow(null, '').optional()
        })
      ).allow(null).required(),

      PatientLanguage: Joi.object({
        LanguageName: Joi.string().allow(null, '').optional(),
        Code_639_1: Joi.string().length(2).allow(null, '').optional(),
        Code_639_2: Joi.string().length(3).allow(null, '').optional()
      }).allow(null, '').optional(),

      IsACO: Joi.boolean().allow(null, '').optional(),
      PatientEnrollments: Joi.array().items(Joi.object().allow(null, '')).optional(),
      MedicareNumber: Joi.string().allow(null, '').optional()
    }).required()
  }).required()
});

export default patientSchema;
