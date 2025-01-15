import { useState, useEffect } from "react";
import { toast } from "sonner";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UjqO1VWlv1XBOTY7zCE9kc6IR_uShi5jvd-9vQDfEFPsnGjHizqvCHUt6c42E3Z9M287w3WKrxUv/pub?output=csv";

export interface IdeaComponents {
  what: string[];
  whom: string[];
  when_to: string[];
}

export function useIdeaComponents() {
  const [ideaComponents, setIdeaComponents] = useState<IdeaComponents>({
    what: [],
    whom: [],
    when_to: []
  });

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        // Parse CSV
        const rows = csvText.split('\n').map(row => row.split(','));
        
        // Skip header row and filter out empty rows
        const dataRows = rows.slice(1).filter(row => row.length === 3);
        
        // Separate columns into arrays
        const components = {
          what: dataRows.map(row => row[0].trim()).filter(Boolean),
          whom: dataRows.map(row => row[1].trim()).filter(Boolean),
          when_to: dataRows.map(row => row[2].trim()).filter(Boolean)
        };
        
        setIdeaComponents(components);
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        toast.error('Failed to load ideas');
      }
    };

    fetchSheetData();
  }, []);

  return ideaComponents;
}