import {
  ConfigContent,
  FieldSettingWriteOnUpdateEnum,
  useConfig,
  useCreateInstallation,
  useDeleteInstallation,
  useInstallation,
  useManifest,
  useUpdateInstallation,
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
import { cn } from "@/lib/utils";

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

type UpdateMode = "Overwrite" | "Skip";

export interface FieldMapping {
  id: string;
  dynamicField: string;
  direction: MappingDirection;
  salesforceField: string;
  defaultValue?: string;
  updateMode: UpdateMode;
}

const INITIAL_MAPPINGS: FieldMapping[] = [
  {
    id: "1",
    dynamicField: "billingCountry",
    direction: "readAndWrite",
    salesforceField: "",
    defaultValue: "",
    updateMode: "Overwrite",
  },
  {
    id: "2",
    dynamicField: "billingState",
    direction: "read",
    salesforceField: "",
    updateMode: "Overwrite",
  },
  {
    id: "3",
    dynamicField: "billingZip",
    direction: "readAndWrite",
    salesforceField: "",
    defaultValue: "",
    updateMode: "Skip",
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
  const selectedObject = manifest?.content?.read?.objects?.[0]; // set the objectname based on tab
  const metadata =
    selectedObject &&
    getCustomerFieldsMetadataForObject(selectedObject.objectName);
  const allFields = metadata?.allFieldsMetaData; // provider fields with metadata
  const allFieldsArray = allFields ? Object.values(allFields) : []; // convert to array for mapping inputs

  const { isPending: isCreating, createInstallation } = useCreateInstallation();
  const { isPending: isUpdating, updateInstallation } = useUpdateInstallation();
  const { installation } = useInstallation();
  const { isPending: isDeleting, deleteInstallation } = useDeleteInstallation();
  const config = useConfig();

  const { isSyncing, syncInstallationConfig } = config;

  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    console.log("Installation config", config.draft);
    // sync config to local state whenever draft changes
    syncConfigToLocalState();
  }, [selectedObject, config.draft]);

  useEffect(() => {
    if (!pendingSubmit) return;
    setPendingSubmit(false); // reset flag
    handleMutateInstallation();
  }, [pendingSubmit, config.draft]);

  const syncConfigToLocalState = () => {
    if (!selectedObject || !config.draft) return;
    const readObject = config.readObject(selectedObject?.objectName);
    const writeObject = config.writeObject(selectedObject?.objectName);
    console.log("Write object", writeObject);
    const fieldMappings = DYNAMIC_FIELDS.map((field, index) => {
      const salesforceField = readObject?.getFieldMapping(field.value) || "";

      // const fieldSettings = writeObject?.getSelectedFieldSettings(field.value);
      const defaultValues = writeObject?.getDefaultValues(salesforceField);
      const writeOnUpdateSetting =
        writeObject?.getWriteOnUpdateSetting(salesforceField);
      console.log("Default values", defaultValues);
      console.log("writeOnUpdateSetting", writeOnUpdateSetting);

      return {
        id: index.toString(),
        dynamicField: field.value,
        direction: (readObject &&
        writeObject?.getWriteObject()?.objectName === selectedObject?.objectName
          ? "readAndWrite"
          : "read") as MappingDirection,
        salesforceField: salesforceField,
        defaultValue: defaultValues?.stringValue,
        updateMode: (writeOnUpdateSetting ===
        FieldSettingWriteOnUpdateEnum.Always
          ? "Overwrite"
          : "Skip") as FieldMapping["updateMode"],
      };
    });
    // sort the mappings by id and set the local state
    setMappings(fieldMappings.sort((a, b) => a.id.localeCompare(b.id)));
  };

  const handleMutateInstallation = async () => {
    if (installation) {
      updateInstallation({
        config: config.draft as ConfigContent,
        onSuccess: (data) => {
          console.log("Installation updated", { installation: data });
        },
        onError: (error) => {
          console.error("Installation update failed", { error });
        },
      });
    } else {
      createInstallation({
        config: config.draft as ConfigContent,
        onSuccess: (data) => {
          console.log("Installation created", { installation: data });
        },
        onError: (error) => {
          console.error("Installation creation failed", { error });
        },
      });
    }
  };

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
          // writeOnCreate:
          //   // map your update mode to the correct advanced field setting
          //   mapping.updateMode === "Auto-fill"
          //     ? FieldSettingWriteOnCreateEnum.Always
          //     : FieldSettingWriteOnCreateEnum.Never,
        },
      });
      // } else {
      //   config.writeObject(selectedObject?.objectName).setDisableWrite();
      // }
    });

    setPendingSubmit(true);

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

  const isLoading = isCreating || isUpdating || isSyncing || isDeleting;

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
                      disabled={isLoading}
                      onValueChange={(value) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id ? { ...m, dynamicField: value } : m
                          )
                        )
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
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
                      disabled={isLoading}
                      onValueChange={(value) =>
                        setMappings((prev) =>
                          prev.map((m) =>
                            m.id === row.id
                              ? {
                                  ...m,
                                  salesforceField: value,
                                  direction:
                                    metadata?.getField(value)?.readOnly === true
                                      ? ("read" as MappingDirection)
                                      : ("readAndWrite" as MappingDirection),
                                }
                              : m
                          )
                        )
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
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
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          isLoading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Overwrite", "Skip"].map((mode) => (
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
      {/* reset to server state */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          syncInstallationConfig();
          syncConfigToLocalState();
        }}
      >
        Reset
      </Button>
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={() => handleCreateInstallation()}
      >
        Install
      </Button>
      {/* Delete installation */}
      <Button
        variant="destructive"
        className="w-full"
        disabled={isDeleting}
        onClick={() => {
          deleteInstallation({
            onSuccess: () => {
              console.log("Installation deleted");
            },
            onError: (error) => {
              console.error("Installation deletion failed", { error });
            },
          });
        }}
      >
        Delete
      </Button>
    </section>
  );
}
