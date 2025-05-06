import type { ConfigContent, } from "@amp-labs/react";

import type { FieldMapping } from "@/components/FieldMappingTable/FieldMappingTable";

interface CreateInstallationParams {
    manifest: any; // TODO: Add proper manifest type
    mappings: FieldMapping[];
    selectedObject: any; // TODO: Add proper object type
}

interface RequiredField {
    fieldName: string;
    [key: string]: any;
}

// Manual create installation
export function createInstallationConfig({ manifest, mappings, selectedObject }: CreateInstallationParams): ConfigContent {
    if (!manifest) throw new Error("Manifest not found");

    // form config object
    const config: ConfigContent = {
        provider: manifest?.content?.provider,
        read: { objects: {} },
    };

    // transform mappings into selectedFieldMappings
    const selectedFieldMappings: { [key: string]: string } = {};
    mappings.forEach((mapping) => {
        selectedFieldMappings[mapping.dynamicField] = mapping.salesforceField;
    });

    // add required fields to selectedFields
    const selectedFields: { [key: string]: boolean } = {};
    selectedObject?.requiredFields?.forEach((field: RequiredField) => {
        if ('fieldName' in field) {
            selectedFields[field.fieldName] = true;
        }
    });

    if (!config.read) {
        config.read = { objects: {} };
    }

    if (selectedObject) {
        config.read.objects = {
            [selectedObject.objectName]: {
                objectName: selectedObject.objectName,
                schedule: selectedObject.schedule,
                destination: selectedObject.destination,
                selectedFields: selectedFields,
                selectedFieldMappings: selectedFieldMappings,
            },
        };
    }

    return config;
} 