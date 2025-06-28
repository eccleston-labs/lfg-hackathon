import { ChangeEvent } from "react";

interface ImageUploadProps {
  selectedImages: File[];
  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export const ImageUpload = ({
  selectedImages,
  onImageSelect,
  onRemoveImage,
}: ImageUploadProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Attach photos (optional)
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onImageSelect}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center"
      >
        <span>Choose photos (max 5, 5MB each)</span>
      </label>

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {selectedImages.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-20 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
              <div className="text-xs text-gray-500 mt-1 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
