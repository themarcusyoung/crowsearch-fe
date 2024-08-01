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
import axios from 'axios';

export default {
  data() {
    return {
      crowCount: 0,
      selectedFile: null,
      fileName: '',
    };
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

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      try {
        console.log('Uploading file:', this.selectedFile.name);
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        this.fileName = response.data.fileName;
        console.log('File uploaded successfully', response.data);

        // Perform further actions like calling a function to count 'crows' in the PDF
        this.countCrows();
      } catch (err) {
        console.error('Error uploading file:', err);
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
