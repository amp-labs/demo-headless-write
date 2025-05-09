import {
  ConfigContent,
  FieldSettingWriteOnCreateEnum,
  FieldSettingWriteOnUpdateEnum,
  useConfig,
  useCreateInstallation,
  useInstallation,
  useManifest,
} from "@amp-labs/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { createInstallationConfig } from "@/lib/installation";

// ----------------------------------
// Types & Mock Data
// ----------------------------------
export type MappingDirection = "readAndWrite" | "read";

// Helpers for rendering icons
const renderDirectionIcon = (dir: MappingDirection) => {
  switch (dir) {
    case "readAndWrite":
      return <span className="text-muted-foreground">↔︎</span>;
    case "read":
      return <span className="text-muted-foreground">←</span>;
  }
};

export interface FieldMapping {
  id: string;
  dynamicField: string;
  direction: MappingDirection;
  salesforceField: string;
  defaultValue?: string;
  updateMode: "Auto-fill" | "Overwrite" | "Skip";
}

const INITIAL_MAPPINGS: FieldMapping[] = [
  {
    id: "1",
    dynamicField: "billingCountry",
    direction: "readAndWrite",
    salesforceField: "",
    defaultValue: "",
    updateMode: "Auto-fill",
  },
  {
    id: "2",
    dynamicField: "billingState",
    direction: "read",
    salesforceField: "",
    updateMode: "Auto-fill",
  },
  {
    id: "3",
    dynamicField: "billingZip",
    direction: "readAndWrite",
    salesforceField: "",
    defaultValue: "",
    updateMode: "Overwrite",
  },
];

const DYNAMIC_FIELDS = [
  {
    label: "Billing Country",
    value: "billingCountry",
  },
  {
    label: "Billing State/Province",
    value: "billingState",
  },
  {
    label: "Billing Zip/Postal Code",
    value: "billingZip",
  },
];

// ----------------------------------
// Component
// ----------------------------------
export function FieldMappingTable() {
  const [mappings, setMappings] = useState<FieldMapping[]>(INITIAL_MAPPINGS);

  const { getCustomerFieldsMetadataForObject, data: manifest } = useManifest();
  const selectedObject = manifest?.content?.read?.objects?.[0];
  const metadata =
    selectedObject &&
    getCustomerFieldsMetadataForObject(selectedObject.objectName);
  const allFields = metadata?.allFieldsMetaData; // provider fields with metadata
  const allFieldsArray = allFields ? Object.values(allFields) : []; // convert to array for mapping inputs

  const { isPending, createInstallation } = useCreateInstallation();
  const { installation } = useInstallation();
  const config = useConfig();

  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    console.log("Installation created", { installation });
  }, [installation]);

  useEffect(() => {
    if (!pendingSubmit) return;
    setPendingSubmit(false); // reset flag
    console.log("Installation config", config.draft);
    // createInstallation(config.draft as ConfigContent);
  }, [pendingSubmit, config.draft]);

  const handleCreateInstallation = async () => {
    // Option 1: utilize the useConfig hook to create the installation config object
    if (!selectedObject) throw new Error("Selected object not found");
    // transform the mappings into a config object
    // for each mappings from the local state
    mappings.forEach((mapping) => {
      // set the field mapping for the selected object
      config.readObject(selectedObject?.objectName).setFieldMapping({
        fieldName: mapping.salesforceField,
        mapToName: mapping.dynamicField,
      });

      // todo: set the write selected object
      // if (mapping.direction === "readAndWrite") {
      config.writeObject(selectedObject?.objectName).setEnableWrite();
      // set advanced write settings
      config.writeObject(selectedObject?.objectName).setSelectedFieldSettings({
        fieldName: mapping.salesforceField,
        settings: {
          _default: {
            // map your default value to the correct field setting
            stringValue: mapping.defaultValue,
          },
          // map your update mode to the correct advanced field setting
          writeOnUpdate:
            mapping.updateMode === "Overwrite"
              ? FieldSettingWriteOnUpdateEnum.Always
              : FieldSettingWriteOnUpdateEnum.Never,
          writeOnCreate:
            // map your update mode to the correct advanced field setting
            mapping.updateMode === "Auto-fill"
              ? FieldSettingWriteOnCreateEnum.Always
              : FieldSettingWriteOnCreateEnum.Never,
        },
      });
      // } else {
      //   config.writeObject(selectedObject?.objectName).setDisableWrite();
      // }
    });

    setPendingSubmit(true);

    // console.log("Installation config", config.get());

    // Option 2: manually create the config object
    // if (!manifest) throw new Error("Manifest not found");
    // const config = createInstallationConfig({
    //   manifest,
    //   mappings,
    //   selectedObject,
    // });
    // const installation = createInstallation(config);
    // console.log("Installation created", installation);
  };

  return (
    <section className="space-y-4 max-w-screen-lg mx-auto">
      <h2 className="text-lg font-semibold">Salesforce fields</h2>
      <p className="text-sm text-muted-foreground">
        Name, Email, Title, and Owner are required fields and can't be removed.
        You can map additional custom fields below.
      </p>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4 items-center gap-2">
                  DYNAMIC FIELDS
                </TableHead>
                <TableHead className="w-[60px]" />
                <TableHead className="w-1/4 items-center gap-2">
                  SALESFORCE FIELDS
                </TableHead>
                <TableHead className="w-1/5 items-center">
                  DEFAULT VALUE
                </TableHead>
                <TableHead className="w-1/5 items-center">
                  FIELDS UPDATE
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {mappings.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/20">
                  {/* Dynamic field */}
                  <TableCell className="w-1/4">
                    <Select
                      value={row.dynamicField}
                      onValueChange={(value) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id ? { ...m, dynamicField: value } : m
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {DYNAMIC_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Direction */}
                  <TableCell className="w-[60px] text-center align-middle">
                    {renderDirectionIcon(row.direction)}
                  </TableCell>

                  {/* Salesforce field */}
                  <TableCell className="w-1/4">
                    <Select
                      value={row.salesforceField}
                      onValueChange={(value) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id
                              ? {
                                  ...m,
                                  salesforceField: value,
                                  // if field is read-only, set direction to read
                                  direction:
                                    metadata?.getField(value)?.readOnly === true
                                      ? "read"
                                      : "readAndWrite",
                                }
                              : m
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field" />
                      </SelectTrigger>
                      <SelectContent>
                        {allFieldsArray.map((f) => (
                          <SelectItem key={f.fieldName} value={f.fieldName}>
                            {f.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Default value */}
                  <TableCell className="w-1/5">
                    <Input
                      placeholder="Value"
                      value={row.defaultValue ?? ""}
                      onChange={(e) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id
                              ? { ...m, defaultValue: e.target.value }
                              : m
                          )
                        )
                      }
                    />
                  </TableCell>

                  {/* Update mode */}
                  <TableCell className="w-1/5">
                    <Select
                      value={row.updateMode}
                      onValueChange={(value) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id
                              ? {
                                  ...m,
                                  updateMode:
                                    value as FieldMapping["updateMode"],
                                }
                              : m
                          )
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Auto-fill", "Overwrite", "Skip"].map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        disabled={isPending}
        onClick={() => {
          console.log("Create installation from mappings", { mappings });
          handleCreateInstallation();
        }}
      >
        Install
      </Button>
    </section>
  );
}
