import oracledb from 'oracledb';

export class MigrationService {

    parseQueryResult(result){
      return result.rows.map(row => {
      let rowData = {};
        result.metaData.forEach((col, index) => {
          rowData[col.name] = row[index];
        });
       return rowData;
      });
    }

  // Function to get a connection to the database
  async getConnection() {
    try {
      return await oracledb.getConnection();
    } catch (err) {
      throw new Error('Error establishing database connection: ' + err.message);
    }
  }

  async patientExists(patientId) {
    const connection = await this.getConnection();
    const checkSql = `SELECT COUNT(*) AS COUNT FROM reg_patient WHERE EXTERNAL_PATIENT_ID = :externalPatientId`;
    try {
      const result = await connection.execute(checkSql, { externalPatientId: patientId });
      console.log(result.rows[0][0]);
      return result.rows[0][0] > 0;
    } catch (err) {
      throw new Error('Error checking patient existence: ' + err.message);
    } finally {
      await connection.close();
    }
  }

  async getPatientData(){

    let connection=await this.getConnection();

    let sql=`SELECT * FROM INTEGRATED_PATIENT WHERE MIGRATION_STATUS = :migrationStatus`
    let sql1=`SELECT * FROM PATIENT_INSURANCE WHERE MIGRATION_STATUS = :migrationStatus`

    try{
        const result = await connection.execute(sql, { migrationStatus: 0});

        return this.parseQueryResult(result);

    }catch(err){
        throw new Error('Error getting patient data: ' + err.message);
    }finally{
        await connection.close();
    }


  }

  async migratePatient() {
    let connection = await this.getConnection();  // Get DB connection
  
    // Get data from the temporary table
    let tempPatient = await this.getPatientData();
  
    try {
      // Assuming tempPatient contains an array of patient data
      if (!tempPatient || tempPatient.length === 0) {
        throw new Error('No patient data found in the temporary table');
      }
  
      for (let patient of tempPatient) {

        if(await this.patientExists(patient.EXTERNAL_PATIENT_ID)){


        }else{
            console.log("not exist");


        }
        
      }
  
      return { success: true };
  
    } catch (err) {
      // If there's an error, log it or throw a detailed message
      await connection.rollback();  // Rollback the transaction if any error occurs
      throw new Error('Error migrating patient record: ' + err.message);
    } finally {
      // Ensure connection is closed after operation
      await connection.close();
    }
  }
}



