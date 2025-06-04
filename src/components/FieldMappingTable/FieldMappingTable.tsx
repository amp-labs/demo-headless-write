import {
  useConfig,
  useCreateInstallation,
  useDeleteInstallation,
  useInstallation,
  useManifest,
  useUpdateInstallation,
} from "@amp-labs/react";

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
// Builder dynamic fields
// ----------------------------------

const DYNAMIC_FIELDS = [
  {
    label: "Billing Country",
    value: "billingCountry",
  },
  {
    label: "Billing State/Province",
    value: "billingState",
  },
];

// ----------------------------------
// Custom Component
// ----------------------------------
export function FieldMappingTable() {
  // ----------------------------------
  // Manifest: Objects & Metadata
  // ----------------------------------
  const { getCustomerFieldsForObject, data: manifest } = useManifest();

  // Selected object (Builder selected object)
  const selectedObject = manifest?.content?.read?.objects?.[0]; // set the objectname based on tab

  // Metadata
  const metadata =
    selectedObject && getCustomerFieldsForObject(selectedObject.objectName);
  const allFields = metadata?.allFields; // provider fields with metadata
  const allFieldsArray = allFields ? Object.values(allFields) : []; // convert to array for mapping inputs

  // ----------------------------------
  // Installation Mutation  Hooks
  // ----------------------------------
  const {
    createInstallation,
    isPending: isCreating,
    error: createError,
  } = useCreateInstallation();
  const {
    updateInstallation,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateInstallation();
  const {
    deleteInstallation,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteInstallation();

  // ----------------------------------
  // Installation Read Hook
  // ----------------------------------
  const { installation } = useInstallation();

  // ----------------------------------
  // Config Read Hook
  // ----------------------------------
  const config = useConfig();

  // ----------------------------------
  // Mutation handlers
  // ----------------------------------
  const handleMutateInstallation = async () => {
    if (!selectedObject) throw new Error("Selected object not found");
    if (installation) {
      updateInstallation({
        config: config.get(),
        onSuccess: (data) => {
          console.log("Installation updated", { installation: data });
        },
        onError: (error) => {
          console.error("Installation update failed", { error });
        },
      });
    } else {
      createInstallation({
        config: config.get(),
        onSuccess: (data) => {
          console.log("Installation created", { installation: data });
        },
        onError: (error) => {
          console.error("Installation creation failed", { error });
        },
      });
    }
  };

  // ----------------------------------
  // Loading state
  // ----------------------------------
  const isLoading = isCreating || isUpdating || isDeleting;

  // ----------------------------------
  // Render UI
  // ----------------------------------
  return (
    <section className="space-y-4 max-w-screen-lg mx-auto">
      <h2 className="text-lg font-semibold">Salesforce Field Mappings</h2>
      <p className="text-sm text-muted-foreground">
        Name, Email, Title, and Owner are required fields and can't be removed.
        You can map additional custom fields below.
      </p>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3 items-center gap-2">
                  DYNAMIC FIELDS
                </TableHead>
                <TableHead className="w-1/3 items-center gap-2">
                  SALESFORCE FIELDS
                </TableHead>
                <TableHead className="w-1/3 items-center gap-2">
                  DEFAULT VALUE
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {DYNAMIC_FIELDS.map((row) => (
                <TableRow key={row.value} className="hover:bg-muted/20">
                  {/* Dynamic field */}
                  <TableCell className="w-1/3">
                    <Select value={row.value} disabled={true}>
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

                  {/* Salesforce field */}
                  <TableCell className="w-1/3">
                    <Select
                      value={
                        selectedObject &&
                        config
                          .readObject(selectedObject?.objectName)
                          .getFieldMapping(row.value)
                      }
                      disabled={isLoading || !selectedObject}
                      onValueChange={(value) => {
                        if (!selectedObject)
                          throw new Error("Selected object not found");
                        config
                          .readObject(selectedObject?.objectName)
                          .setFieldMapping({
                            fieldName: value,
                            mapToName: row.value,
                          });
                      }}
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

                  {/* Default value - advanced write feature */}
                  <TableCell className="w-1/3">
                    <Input
                      type="text"
                      className={cn(
                        "w-full px-3 py-2 border rounded-md",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isLoading || !selectedObject}
                      placeholder="Enter default value"
                      value={
                        selectedObject?.objectName
                          ? config
                              .writeObject(selectedObject?.objectName)
                              .getDefaultValues(row.value)?.stringValue
                          : ""
                      }
                      onChange={(e) => {
                        const objectName = selectedObject?.objectName;
                        if (!objectName) return;
                        config.writeObject(objectName).setDefaultValues({
                          fieldName: row.value,
                          value: {
                            stringValue: e.target.value,
                          },
                        });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {createError && <p className="text-red-500">{createError.message}</p>}
      {updateError && <p className="text-red-500">{updateError.message}</p>}
      {deleteError && <p className="text-red-500">{deleteError.message}</p>}
      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      <div className="flex gap-4">
        {/* Delete installation */}
        <Button
          variant="destructive"
          className="flex-1"
          disabled={isLoading}
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
        {/* reset to server state */}
        <Button
          variant="outline"
          className="flex-1"
          disabled={isLoading}
          onClick={() => config.reset()}
        >
          Reset
        </Button>
        {/* Install / Update / Create*/}
        <Button
          className="flex-1"
          disabled={isLoading}
          onClick={() => handleMutateInstallation()}
        >
          Install
        </Button>
      </div>
    </section>
  );
}
