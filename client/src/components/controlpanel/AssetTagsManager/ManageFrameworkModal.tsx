import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  Dropdown,
  Icon,
  Input,
  Modal,
  ModalProps,
  Select,
  Table,
} from "semantic-ui-react";
import {
  AssetTag,
  AssetTagFramework,
  AssetTagValueTypeOptions,
} from "../../../types";
import CtlCheckbox from "../../ControlledInputs/CtlCheckbox";
import CtlTextInput from "../../ControlledInputs/CtlTextInput";
import "../../../styles/global.css";
import { isAssetTag, isAssetTagArray } from "../../../utils/typeHelpers";
import { useEffect, useState } from "react";
import CtlDropdown from "../../ControlledInputs/CtlDropdown";
import useGlobalError from "../../error/ErrorHooks";
import api from "../../../api";
import LoadingSpinner from "../../LoadingSpinner";
import { truncateString } from "../../util/HelperFunctions";
import EditDropdownOptionsModal from "./EditDropdownOptionsModal";
import { cleanDropdownOptions } from "../../../utils/assettagHelpers";

interface ManageFrameworkModalProps extends ModalProps {
  open: boolean;
  mode: "create" | "edit";
  id?: string;
  onClose: () => void;
}

const ManageFrameworkModal: React.FC<ManageFrameworkModalProps> = ({
  open,
  mode,
  id,
  onClose,
}) => {
  // Global State & Hooks
  const { handleGlobalError } = useGlobalError();
  const { control, formState, reset, watch, getValues, setValue, register } =
    useForm<AssetTagFramework>({
      defaultValues: {
        name: "",
        description: "",
        enabled: true,
        tags: [],
      },
    });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "tags",
    }
  );

  // Data & UI
  const [loading, setLoading] = useState<boolean>(false);
  const [showEditDropdownOptions, setShowEditDropdownOptions] =
    useState<boolean>(false);
  const [editDropdownOptionsIndex, setEditDropdownOptionsIndex] = useState<
    number | null
  >(null);

  // Effects
  useEffect(() => {
    if (mode === "edit" && id) loadFramework(id);
  }, [id]);

  // Handlers & Methods
  async function loadFramework(id: string) {
    try {
      setLoading(true);
      const res = await api.getFramework(id);
      if (!res.data.framework) throw new Error("No framework found");

      reset(res.data.framework);
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const cleaned = cleanDropdownOptions(getValues("tags"));
    setValue("tags", cleaned);
    if (mode === "create") {
      return createFramework(getValues());
    }
    return updateFramework(getValues());
  }

  async function createFramework(framework: AssetTagFramework) {
    try {
      setLoading(true);
      await api.createFramework(framework);

      onClose();
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateFramework(framework: AssetTagFramework) {
    try {
      if (!framework.uuid)
        throw new Error("No ID provided for updateFramework");
      setLoading(true);

      await api.updateFramework(framework);
      onClose();
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddTag() {
    append({ title: "", valueType: "text", isDeleted: false });
  }

  function handleEditDropdownOptions(index: number) {
    setEditDropdownOptionsIndex(index);
    setShowEditDropdownOptions(true);
  }

  function handleCloseEditDropdownOptionsModal() {
    setEditDropdownOptionsIndex(null);
    setShowEditDropdownOptions(false);
  }

  function getOptionsString(index: number): string {
    if (!getValues(`tags.${index}.options`)) return "No options set";

    if (
      getValues(`tags.${index}.options`) &&
      (getValues(`tags.${index}.options`) as string[]).length > 0
    ) {
      return truncateString(
        watch(`tags.${index}.options`)?.join(", ") ?? "",
        50
      );
    }

    return "No options set";
  }

  return (
    <Modal open={open} onClose={() => onClose()} size="fullscreen">
      <Modal.Header>
        <div className="flex justify-between">
          <span>{mode === "create" ? "Create" : "Edit"} Framework</span>
          <div className="flex">
            <CtlCheckbox name="enabled" control={control} toggle />
            <p className="text-base ml-2">Enabled?</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Content scrolling>
        {loading && (
          <div className="my-4r">
            <LoadingSpinner />
          </div>
        )}
        {!loading && (
          <div className="mb-8">
            <CtlTextInput name="name" control={control} label="Name" fluid />
            <CtlTextInput
              name="description"
              control={control}
              label="Description"
              className="mt-6"
              fluid
            />
            <p className="!mt-6 form-field-label">Default Tags</p>
            <Table celled className="!mt-1">
              <Table.Header fullWidth>
                <Table.Row key="header">
                  <Table.HeaderCell>Tag Title</Table.HeaderCell>
                  <Table.HeaderCell>Value Type</Table.HeaderCell>
                  <Table.HeaderCell>Options</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(!watch("tags") || watch("tags").length === 0) && (
                  <Table.Row>
                    <Table.Cell colSpan={3} className="text-center">
                      No tags have been added to this framework.
                    </Table.Cell>
                  </Table.Row>
                )}
                {fields.map(
                  (tag, index) =>
                    isAssetTag(tag) && (
                      <Table.Row key={tag.id}>
                        <Table.Cell>
                          <Controller
                            render={({ field }) => <Input {...field} fluid />}
                            name={`tags.${index}.title`}
                            control={control}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Controller
                            render={({ field }) => (
                              <Dropdown
                                options={AssetTagValueTypeOptions}
                                {...field}
                                onChange={(e, data) => {
                                  field.onChange(
                                    data.value?.toString() ?? "text"
                                  );
                                }}
                                fluid
                              />
                            )}
                            name={`tags.${index}.valueType`}
                            control={control}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          {watch(`tags.${index}.valueType`) === "dropdown" ? (
                            <div className="flex items-center">
                              <p className="mr-2">{getOptionsString(index)}</p>
                              <Button
                                icon="edit"
                                onClick={() => handleEditDropdownOptions(index)}
                              />
                            </div>
                          ) : (
                            <span className="muted-text">N/A</span>
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button
                            color="red"
                            icon="trash"
                            onClick={() => remove(index)}
                          ></Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                )}
              </Table.Body>
            </Table>
            <Button color="blue" onClick={() => handleAddTag()}>
              <Icon name="plus" />
              Add Tag
            </Button>
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button color="green" onClick={() => handleSave()}>
          Save
        </Button>
      </Modal.Actions>
      {editDropdownOptionsIndex !== null && (
        <EditDropdownOptionsModal
          open={showEditDropdownOptions}
          index={editDropdownOptionsIndex}
          control={control}
          onClose={() => handleCloseEditDropdownOptionsModal()}
        />
      )}
    </Modal>
  );
};

export default ManageFrameworkModal;
