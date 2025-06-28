import { FormEvent, ChangeEvent } from "react";
import { ReportFormData, OSMPlace } from "@/types";
import { ImageUpload } from "./ImageUpload";
import { PlaceSearch } from "./PlaceSearch";
import { useEffect, useRef } from "react";

interface ReportFormProps {
  formData: ReportFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onPlaceSelect: (place: OSMPlace | undefined) => void;
  onSubmit: (e: FormEvent) => void;
  selectedImages: File[];
  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  isUploading: boolean;
  onFillTestData: () => void;
  postcodeError?: string | null;
}

export const ReportForm = ({
  formData,
  onInputChange,
  onPlaceSelect,
  onSubmit,
  selectedImages,
  onImageSelect,
  onRemoveImage,
  isUploading,
  onFillTestData,
  postcodeError,
}: ReportFormProps) => {
  const errorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (postcodeError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [postcodeError]);

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Greyed out Text/Audio Toggle */}
      <div className="flex gap-4 border-b border-gray-200 opacity-50 pointer-events-none">
        <button
          type="button"
          className="pb-2 px-1 border-b-2 border-transparent text-gray-400 font-medium"
        >
          Text
        </button>
        <button
          type="button"
          className="pb-2 px-1 border-b-2 border-transparent text-gray-400 font-medium"
        >
          Audio
        </button>
      </div>

      {/* Test Data Button */}
      <button
        type="button"
        onClick={onFillTestData}
        className="w-full py-2 px-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors border border-blue-300"
      >
        Fill with test data
      </button>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Postcode - VITAL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Town or city or Postcode{" "}
            <span className="text-red-500 font-bold">(VITAL INFORMATION)</span>
          </label>
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) => onInputChange("postcode", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="e.g. S10 5GG"
            required
          />
          {postcodeError && (
            <div 
              ref={errorRef}
              className="text-red-600 text-sm mb-2">{postcodeError}</div>
          )}
        </div>

        {/* Address Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you have any other address details e.g property number or road
            name? Can you tell us anything that will help us identify the
            location?
          </label>
          <textarea
            value={formData.addressDetails}
            onChange={(e) => onInputChange("addressDetails", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
            placeholder="Additional location details..."
          />
        </div>

        {/* Place Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for a specific place or landmark (optional)
          </label>
          <PlaceSearch
            selectedPlace={formData.selectedPlace}
            onPlaceSelect={onPlaceSelect}
            placeholder="e.g. Sheffield University, Meadowhall Shopping Centre..."
          />
          <p className="text-xs text-gray-500 mt-1">
            This helps provide more precise location information alongside your
            postcode
          </p>
        </div>

        {/* When it happened */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you know when it happened?{" "}
            <span className="text-red-500">(Required Info)</span>
          </label>
          <input
            type="text"
            value={formData.whenHappened}
            onChange={(e) => onInputChange("whenHappened", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Date and time..."
            required
          />
        </div>

        {/* What happened */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what happened.{" "}
            <span className="text-red-500">(Required Info)</span>
          </label>
          <textarea
            value={formData.whatHappened}
            onChange={(e) => onInputChange("whatHappened", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-none"
            placeholder="Describe what happened..."
            required
          />
        </div>

        {/* People details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you know about the person / people? Can you tell us their
            names, age or where they live (if different from the address of the
            crime)?
          </label>
          <textarea
            value={formData.peopleDetails}
            onChange={(e) => onInputChange("peopleDetails", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
            placeholder="Names, ages, addresses..."
          />
        </div>

        {/* People appearance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What does the person / people look like?
          </label>
          <textarea
            value={formData.peopleAppearance}
            onChange={(e) => onInputChange("peopleAppearance", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-20 resize-none"
            placeholder="Physical description..."
          />
        </div>

        {/* Contact details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do you know any contact details for the person / people?
          </label>
          <input
            type="text"
            value={formData.contactDetails}
            onChange={(e) => onInputChange("contactDetails", e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Phone numbers, social media, etc..."
          />
        </div>

        {/* Vehicle access */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="hasVehicle"
            checked={formData.hasVehicle}
            onChange={(e) => onInputChange("hasVehicle", e.target.checked)}
            className="w-5 h-5"
          />
          <label
            htmlFor="hasVehicle"
            className="text-sm font-medium text-gray-700"
          >
            Do any of the people involved in the crime have access to a
            vehicle/vehicles?
          </label>
        </div>

        {/* Weapon access */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="hasWeapon"
            checked={formData.hasWeapon}
            onChange={(e) => onInputChange("hasWeapon", e.target.checked)}
            className="w-5 h-5"
          />
          <label
            htmlFor="hasWeapon"
            className="text-sm font-medium text-gray-700"
          >
            Do any of the people involved in the crime have access to a
            weapon/weapons?
          </label>
        </div>

        {/* Attach Photos */}
        <ImageUpload
          selectedImages={selectedImages}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading}
        className="w-full bg-gray-900 text-white font-bold text-lg py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            Uploading images & submitting...
          </div>
        ) : (
          "Submit"
        )}
      </button>
    </form>
  );
};
