import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to UI format
      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c,
        description: task.description_c || "",
        priority: task.priority_c || "medium",
        status: task.status_c || "active",
        createdAt: task.CreatedOn,
        completedAt: task.completed_at_c
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('task_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      const task = response.data;
      return {
        Id: task.Id,
        title: task.title_c,
        description: task.description_c || "",
        priority: task.priority_c || "medium",
        status: task.status_c || "active",
        createdAt: task.CreatedOn,
        completedAt: task.completed_at_c
      };
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          title_c: taskData.title,
          description_c: taskData.description || "",
          priority_c: taskData.priority || "medium",
          status_c: taskData.status || "active",
          completed_at_c: taskData.completedAt || null
        }]
      };

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const task = successful[0].data;
          return {
            Id: task.Id,
            title: task.title_c,
            description: task.description_c || "",
            priority: task.priority_c || "medium",
            status: task.status_c || "active",
            createdAt: task.CreatedOn,
            completedAt: task.completed_at_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Map UI field names to database field names
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title_c = updates.title;
      if (updates.description !== undefined) dbUpdates.description_c = updates.description;
      if (updates.priority !== undefined) dbUpdates.priority_c = updates.priority;
      if (updates.status !== undefined) dbUpdates.status_c = updates.status;
      if (updates.completedAt !== undefined) dbUpdates.completed_at_c = updates.completedAt;

      const params = {
        records: [{
          Id: parseInt(id),
          ...dbUpdates
        }]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const task = successful[0].data;
          return {
            Id: task.Id,
            title: task.title_c,
            description: task.description_c || "",
            priority: task.priority_c || "medium",
            status: task.status_c || "active",
            createdAt: task.CreatedOn,
            completedAt: task.completed_at_c
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
};