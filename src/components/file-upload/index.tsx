'use client';

import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import authApi from '@/utils/authApi';

interface FileUploadProps {
  onFilesChange: Dispatch<SetStateAction<{ url: string; fileName: string }[]>>;
  acceptedTypes?: string;
  label?: string;
  multiple?: boolean;
  id?: string; // Add unique ID prop
}

export default function FileUpload({
  onFilesChange,
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  label = 'Upload files',
  multiple = true,
  id = 'file-upload', // Default ID
}: FileUploadProps) {
  const [documents, setDocuments] = useState<Array<{ url: string; fileName: string; file?: File }>>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFileToStorage = async (file: File): Promise<{ url: string; fileName: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.fileUrl,
        fileName: response.data.fileName,
      };
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${file.name}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      setUploading(true);
      try {
        const newDocuments = await Promise.all(
          Array.from(files).map(async (file) => {
            const uploadedFile = await uploadFileToStorage(file);
            return {
              url: uploadedFile.url,
              fileName: uploadedFile.fileName,
              file,
            };
          })
        );

        const updatedDocuments = multiple ? [...documents, ...newDocuments] : newDocuments;
        setDocuments(updatedDocuments);
        onFilesChange(updatedDocuments.map(({ url, fileName }) => ({ url, fileName })));
      } catch (error) {
        console.error('File upload error:', error);
      } finally {
        setUploading(false);
      }
    },
    [documents, onFilesChange, multiple]
  );

  const removeDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onFilesChange(updatedDocuments.map(({ url, fileName }) => ({ url, fileName })));
  };
  
  return (
    <div>
      <div className="border-2 border-dashed border-border rounded-lg p-6">
        <div className="text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-sm text-muted-foreground mb-2">{label}</div>
          <Button type="button" variant="outline" size="sm" asChild disabled={uploading}>
            <label htmlFor={id} className="cursor-pointer">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Choose Files'
              )}
              <input
                id={id}
                type="file"
                multiple={multiple}
                accept={acceptedTypes}
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label>Uploaded Documents:</Label>
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{doc.fileName}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}