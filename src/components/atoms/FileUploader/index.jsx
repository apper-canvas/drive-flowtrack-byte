import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const existingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    
    // Check if files have actually changed
    const currentFiles = config.existingFiles;
    const prevFiles = existingFilesRef.current;
    
    // Simple change detection based on length and first file's ID
    if (currentFiles.length !== prevFiles.length) {
      return currentFiles;
    }
    
    if (currentFiles.length > 0 && prevFiles.length > 0) {
      const currentFirstId = currentFiles[0].Id || currentFiles[0].id;
      const prevFirstId = prevFiles[0].Id || prevFiles[0].id;
      if (currentFirstId !== prevFirstId) {
        return currentFiles;
      }
    }
    
    return prevFiles;
  }, [config.existingFiles]);

  // Initial Mount Effect
  useEffect(() => {
    let isMounted = true;
    
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to load - max 50 attempts × 100ms = 5 seconds
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        if (!isMounted) return;

        const { ApperFileUploader } = window.ApperSDK;
        
        // Set unique element ID
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: existingFiles
        });
        
        mountedRef.current = true;
        existingFilesRef.current = existingFiles;
        
        if (isMounted) {
          setIsReady(true);
          setError(null);
        }
        
      } catch (err) {
        console.error('ApperFileFieldComponent mount error:', err);
        if (isMounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };

    initializeSDK();

    // Cleanup on component destruction
    return () => {
      isMounted = false;
      if (window.ApperSDK && mountedRef.current) {
        try {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        } catch (err) {
          console.error('Unmount error:', err);
        }
      }
      mountedRef.current = false;
      existingFilesRef.current = [];
    };
  }, [elementId, config]);

  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) return;

    const updateFiles = async () => {
      try {
        // Deep equality check with JSON.stringify
        const currentFilesStr = JSON.stringify(existingFiles);
        const prevFilesStr = JSON.stringify(existingFilesRef.current);
        
        if (currentFilesStr === prevFilesStr) return;

        const { ApperFileUploader } = window.ApperSDK;
        
        // Format detection - check for .Id vs .id property
        let formattedFiles = existingFiles;
        if (existingFiles.length > 0) {
          const hasApiFormat = existingFiles[0].hasOwnProperty('Id');
          if (hasApiFormat) {
            // Convert from API format to UI format
            formattedFiles = ApperFileUploader.toUIFormat(existingFiles);
          }
        }
        
        // Update files or clear field based on length
        if (formattedFiles.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, formattedFiles);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = existingFiles;
        
      } catch (err) {
        console.error('File update error:', err);
        setError(err.message);
      }
    };

    updateFiles();
  }, [existingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50">
        <div className="flex items-center space-x-2 text-red-800">
          <span className="text-sm font-medium">File Upload Error:</span>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main container with unique ID */}
      <div 
        id={elementIdRef.current}
        className="w-full min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg"
      >
        {/* Loading UI */}
        {!isReady && (
          <div className="flex items-center justify-center h-24 text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading file uploader...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;