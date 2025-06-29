"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";


export default function SyntheticDataPage() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  function generateSyntheticIncidentDate(i: number) {
    const now = Date.now();
    // Subtract a random number of days (0-30).
    var adjusted = new Date(now - (24*60*60*1000 * (i%30)));
    // Set hours (weight it towards evening reports)
    const hour_weight = [6,4,3,1,1,1,1,2,3,3,3,3,3,4,4,4,4,5,6,7,7,8,8,9];
    var hw_sum = 1;
    hour_weight.forEach((element) => {hw_sum += element});
    var rng_hr = Math.floor(Math.random() * hw_sum)
    for (let i = 0; i < hour_weight.length; i++)
        rng_hr -= hour_weight[i];
        if (rng_hr <= 0)
            adjusted.setHours(i);
    adjusted.setHours(7);
    // Then set minutes
    adjusted.setMinutes(Math.floor(Math.random() * 60));
    // Then set seconds
    adjusted.setSeconds(Math.floor(Math.random() * 60));
    return adjusted;
  }
  function generateSyntheticName(i: number) {
    const t = Math.random();
    if (t < 0.7) {
      return "";
    } else if (t < 0.9) {
      return "unknown"
    } else {
      // Generate a synthetic perp name
      const forenames = ["Alice", "Bob", "Mallory", "Muhammad", "Noah", "Oliver", "George", "Leo", "Thomas", "Tom", "Robert", "Jack", "jake", "adam", "david", "geoff", "chris", "christopher", "ryan", "ed", "tim", "philip", "Claire", "Amy"];
      const surnames = ["Smith", "Jones", "Williams", "Taylor", "Brown", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Robinson", "Wright", "Walker"];
      var forename = forenames[Math.floor(Math.random()*forenames.length)];
      if (0.8 < Math.random()) {
          return forename;
      } else {
          return forename + " " + surnames[Math.floor(Math.random()*surnames.length)];
      }
    }
  }
  function generateSyntheticCrimeType(i: number) {
      const types = ["theft", "mugging", "shoplifting", "burglary", "vandalism"]
      return types[i%types.length];
  }
  function generateSyntheticRawText(i: number) {
      const type = generateSyntheticCrimeType(i);
      const time = generateSyntheticIncidentDate(i);
      const location = "some street";
      var suspect_clothes = "";
      const colors = ["red", "blue", "green", "black", "white", "denim"]
      const hats = ["wooly hat", "snapback", "baseball hat"]
      if (Math.random() < 0.2) {
          suspect_clothes += colors[Math.floor(Math.random()*colors.length)] + " " + hats[Math.floor(Math.random()*hats.length)];
      }
      if (Math.random() < 0.3) {
          if (suspect_clothes.length)
            suspect_clothes += ", "
          suspect_clothes += "glasses";
      }
      const uppers = ["hoodie", "tshirt", "jacket", "coat", "jumper", "fleece"]
      if (Math.random() < 0.8) {
          if (suspect_clothes.length)
            suspect_clothes += ", "
          suspect_clothes += colors[Math.floor(Math.random()*colors.length)] + " " + uppers[Math.floor(Math.random()*uppers.length)];
      }
      const lowers = ["trousers", "shorts"]
      if (Math.random() < 0.9) {
          if (suspect_clothes.length)
            suspect_clothes += " and "
          suspect_clothes += colors[Math.floor(Math.random()*colors.length)] + " " + lowers[Math.floor(Math.random()*lowers.length)];
      }

      
      // colour/(hoodie/hat/trousers/jacket/tshirt/coat)
      var rtn = `At approximately ${time.toLocaleTimeString()}, I witnessed a ${type} at ${location}. `
      if (suspect_clothes.length){
        rtn += `I think the suspect was a man wearing ${suspect_clothes}.`
      }
      return rtn;
  }

  function generateSyntheticLocation(i: number) {
    // 51.5072° N, 0.1276° W
    //51.4939726&lng=-0.0733479
    const n = 51.4939726 + Math.random() - 0.5;
    const w = -0.0733479 + Math.random() - 0.5;

    return `POINT(${n} ${w})`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const num = parseInt(number, 10);

    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid positive number.");
      setLoading(false);
      return;
    }

    // Example: Insert 'num' synthetic records into the "reports" table
    // You may want to customize the data structure as needed
    const records = Array.from({ length: num }).map((_, i) => ({
      // Replace with your actual table columns and synthetic data
      created_at: new Date().toISOString(),
      incident_date: generateSyntheticIncidentDate(i).toISOString(),
      raw_text: generateSyntheticRawText(i),
      is_anonymous: true, // Never show synthetic user information
      shared_with_crimestoppers: false, // Synthetic data should not be reported
      status: "submitted",
      location: generateSyntheticLocation(i), //
      //location: {
      //  type: "Point",
      //  coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90], // Random coordinates
      //}, //todo
      crime_type: generateSyntheticCrimeType(i),
      location_hint: "bar", //todo text
      postcode: "SW1A 1AA", //todo text
      time_known: false, //todo bool
      time_description: "rough hour", //todo text
      people_description: "unknown", //todo text
      people_names: generateSyntheticName(i),
      people_appearance: "unknown", //todo text
      people_contact_info: "unknown", //todo text
      has_vehicle: false, //todo bool
      has_weapon: false, //todo bool
      user_id: "f4b8320a-0fad-428a-abd5-9e885817551d", //synthetic@robadob.org
    }));

    const { error } = await supabase.from("reports").insert(records);

    setLoading(false);
    
    if (error) {
      alert("Error creating records: " + error.message);
    } else {
      alert(`Successfully created ${num} synthetic reports!`);
      setNumber("");
    }
  };

  return (
    <main>
      <h1>Synthetic Data Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Enter the number of reports to generate:
          <input
            type="number"
            value={number}
            onChange={e => setNumber(e.target.value)}
            className="ml-2 px-2 py-1 border rounded"
            required
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Submit
        </button>
      </form>
    </main>
  );
}