import React from 'react';

interface MedicalHistoryDisplayProps {
  historyString: string;
}

const MedicalHistoryDisplay: React.FC<MedicalHistoryDisplayProps> = ({ historyString }) => {
  if (!historyString) return <span>None reported</span>;

  // The string looks like: "Reason: \nDiseases: Hello\nAllergies: Hello\nMeds: Hello\nEmergency: \nNotes: Hello\nType: In-person"
  // We only want to keep: Diseases, Allergies, Meds, Notes.

  const lines = historyString.split('\n');
  const keyMap: Record<string, string> = {
    'Diseases': 'Existing Diseases',
    'Allergies': 'Allergies',
    'Meds': 'Current Medications',
    'Notes': 'Previous History'
  };
  
  const parsedItems: { key: string; value: string }[] = [];

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const internalKey = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if (keyMap[internalKey] && value) {
        parsedItems.push({ key: keyMap[internalKey], value });
      }
    }
  });

  if (parsedItems.length === 0) return <span>None reported</span>;

  return (
    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
      {parsedItems.map((item, idx) => (
        <li key={idx} style={{ marginBottom: '4px' }}>
          <strong>{item.key}:</strong> {item.value}
        </li>
      ))}
    </ul>
  );
};

export default MedicalHistoryDisplay;
