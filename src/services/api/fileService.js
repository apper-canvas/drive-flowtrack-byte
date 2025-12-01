import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const fileService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords('files_c', params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(file => ({
        Id: file.Id,
        name: file.Name,
        taskId: file.task_c?.Id || file.task_c,
        taskName: file.task_c?.Name || 'Unknown Task',
        fileData: file.file_data_c,
        fileName: file.file_name_c,
        fileSize: file.file_size_c,
        fileType: file.file_type_c,
        description: file.description_c || "",
        createdAt: file.CreatedOn
      }));
    } catch (error) {
      console.error("Error fetching files:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(fileId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('files_c', fileId, params);

      if (!response?.data) {
        return null;
      }

      const file = response.data;
      return {
        Id: file.Id,
        name: file.Name,
        taskId: file.task_c?.Id || file.task_c,
        taskName: file.task_c?.Name || 'Unknown Task',
        fileData: file.file_data_c,
        fileName: file.file_name_c,
        fileSize: file.file_size_c,
        fileType: file.file_type_c,
        description: file.description_c || "",
        createdAt: file.CreatedOn
      };
    } catch (error) {
      console.error(`Error fetching file ${fileId}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(fileData, taskId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      if (!taskId) {
        throw new Error("Task ID is required for file creation");
      }

      // Convert files to API format
      const { ApperFileUploader } = window.ApperSDK;
      const convertedFiles = ApperFileUploader.toCreateFormat(fileData.file_data_c);

      const params = {
        records: [{
          Name: fileData.file_data_c[0]?.Name || fileData.fileName || 'Untitled File',
          task_c: parseInt(taskId),
          file_data_c: convertedFiles,
          file_name_c: fileData.file_data_c[0]?.Name || fileData.fileName || '',
          file_size_c: fileData.file_data_c[0]?.Size || fileData.fileSize || 0,
          file_type_c: fileData.file_data_c[0]?.Type || fileData.fileType || '',
          description_c: fileData.description || ""
        }]
      };

      const response = await apperClient.createRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} files:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const file = successful[0].data;
          return {
            Id: file.Id,
            name: file.Name,
            taskId: file.task_c,
            fileData: file.file_data_c,
            fileName: file.file_name_c,
            fileSize: file.file_size_c,
            fileType: file.file_type_c,
            description: file.description_c || "",
            createdAt: file.CreatedOn
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  },

  async delete(fileId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: [parseInt(fileId)]
      };

      const response = await apperClient.deleteRecord('files_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} files:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
};