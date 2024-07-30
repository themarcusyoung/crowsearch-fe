<template>
  <div class="crow-search">
    <h1>CrowSearch</h1>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile">Upload PDF</button>
    <div class="count-display">
      crows: <span>{{ crowCount }}</span>
    </div>
  </div>
</template>

<script>
import AWS from 'aws-sdk';

export default {
  data() {
    return {
      crowCount: 0,
      s3: null,
      dynamoDB: null,
      selectedFile: null,
    };
  },
  mounted() {
    console.log('Mounted: Initializing AWS SDK');
    console.log('AWS Region:', process.env.VUE_APP_AWS_REGION);
    console.log('AWS S3 Bucket:', process.env.VUE_APP_S3_BUCKET_NAME);
    console.log('AWS DynamoDB Table:', process.env.VUE_APP_DYNAMODB_TABLE_NAME);
    // Initialize AWS SDK using environment variables
    AWS.config.update({
      region: process.env.VUE_APP_AWS_REGION,
      accessKeyId: process.env.VUE_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.VUE_APP_AWS_SECRET_ACCESS_KEY,
    });

    this.s3 = new AWS.S3();
    this.dynamoDB = new AWS.DynamoDB.DocumentClient();
    console.log('AWS SDK initialized');
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        console.log('File selected:', file.name);
      } else {
        console.error('No file selected');
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        console.error('No file selected');
        return;
      }
      const file = this.selectedFile;
      const params = {
        Bucket: process.env.VUE_APP_S3_BUCKET_NAME,
        Key: file.name,
        Body: file,
        ContentType: file.type,
      };

      try {
        console.log('Uploading file:', file.name);
        await this.s3.upload(params).promise();
        console.log('File uploaded successfully');
        await this.saveToDynamoDB(file.name);
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    },
    async saveToDynamoDB(fileName) {
      const uniqueId = `${Date.now()}`;  // Generate a unique primary key
      const s3Path = `s3://${process.env.VUE_APP_S3_BUCKET_NAME}/${fileName}`;

      const params = {
        TableName: process.env.VUE_APP_DYNAMODB_TABLE_NAME,
        Item: {
          SESSION_ID: uniqueId,
          fileName: fileName,
          s3Path: s3Path,
          status: 'processing',
          result: null
        },
      };

      try {
        console.log('Saving to DynamoDB:', fileName);
        await this.dynamoDB.put(params).promise();
        console.log('Record saved to DynamoDB');
      } catch (err) {
        console.error('Error saving to DynamoDB:', err);
      }
    },
    countCrows() {
      // Implement your logic to count occurrences of 'crow' in the uploaded PDF file
      // For demonstration purposes, we'll just increment the counter
      this.crowCount++;
    },
  },
};
</script>

<style>
.crow-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

input[type="file"] {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

.count-display {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  color: #333;
}

.count-display span {
  font-weight: bold;
  color: #d9534f;
}
</style>
