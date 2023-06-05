import {
  Modal,
  Form,
  Divider,
  Button,
  Icon,
  ModalProps,
  Loader,
  List,
  Image,
  Dropdown,
  Popup,
} from "semantic-ui-react";
import { Project, User } from "../../types";
import { isEmptyString, sortUsersByName } from "../util/HelperFunctions";
import { useCallback, useState } from "react";
import { projectRoleOptions } from "../util/ProjectHelpers";
import axios from "axios";
import useGlobalError from "../error/ErrorHooks";
import useDebounce from "../../hooks/useDebounce";

type ProjectDisplayMember = User & { roleValue: string; roleDisplay: string };
type TeamUserOpt = {
  key: string;
  text: string;
  value: string;
  image?: { avatar?: boolean; src?: string };
};

interface ManageTeamModalProps extends ModalProps {
  show: boolean;
  project: Project;
  onDataChanged: () => void;
  onClose: () => void;
}

const ManageTeamModal: React.FC<ManageTeamModalProps> = ({
  show,
  project,
  onDataChanged,
  onClose,
}) => {
  const { handleGlobalError } = useGlobalError();
  const { debounce } = useDebounce();
  const [loading, setLoading] = useState<boolean>(false);
  const [teamUserOptions, setTeamUserOptions] = useState<TeamUserOpt[]>([]);
  const [teamUserOptsLoading, setTeamUserOptsLoading] =
    useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>("");

  /**
   * Retrieves a list of users that can be added as team members to the
   * project, then processes and sets them in state.
   */
  const getTeamUserOptions = async (searchString: string) => {
    try {
      if (!project.projectID) return;

      setTeamUserOptsLoading(true);
      const res = await axios.get(
        `/project/${project.projectID}/team/addable?search=${searchString}`
      );
      if (res.data.err) {
        handleGlobalError(res.data.errMsg);
        return;
      }

      if (!res.data.users || !Array.isArray(res.data.users)) {
        throw new Error(
          "Invalid response from server. This may be caused by an internal error."
        );
      }

      var newOptions: TeamUserOpt[] = [];
      res.data.users.forEach((item: User) => {
        newOptions.push({
          key: item.uuid,
          text: `${item.firstName} ${item.lastName}`,
          value: item.uuid,
          image: {
            avatar: true,
            src: item.avatar,
          },
        });
      });
      newOptions.sort((a, b) => {
        var normalizedA = String(a.text)
          .toLowerCase()
          .replace(/[^a-zA-Z]/gm, "");
        var normalizedB = String(b.text)
          .toLowerCase()
          .replace(/[^a-zA-Z]/gm, "");
        if (normalizedA < normalizedB) {
          return -1;
        }
        if (normalizedA > normalizedB) {
          return 1;
        }
        return 0;
      });
      newOptions.unshift({ key: "empty", text: "Clear...", value: "" });
      setTeamUserOptions(newOptions);
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setTeamUserOptsLoading(false);
    }
  };

  const getTeamUserOptionsDebounced = debounce(
    (inputVal: string) => getTeamUserOptions(inputVal),
    500
  );

  /**
   * Submits a PUT request to the server to update the team member's
   * role in the project, then refreshes the project data.
   * @param {String} memberUUID - the UUID of the team member to update
   * @param {String} newRole - the new role setting
   */
  const submitChangeTeamMemberRole = async (
    memberUUID: string,
    newRole: string
  ) => {
    try {
      if (
        isEmptyString(memberUUID) ||
        isEmptyString(newRole) ||
        isEmptyString(project.projectID)
      ) {
        throw new Error(
          "Invalid user UUID or role. This may be caused by an internal error."
        );
      }

      setLoading(true);
      const res = await axios.put(
        `/project/${project.projectID}/team/${memberUUID}/role`,
        {
          newRole: newRole,
        }
      );
      if (res.data.err) {
        handleGlobalError(res.data.errMsg);
        return;
      }

      setTeamUserOptions([]);
      onDataChanged();
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submits a PUT request to the server to remove the specified user
   * from the project's team, then refreshes the
   * project data and Addable Users options.
   * @param  {String} memberUUID  - the uuid of the user to remove
   */
  const submitRemoveTeamMember = async (memberUUID: string) => {
    try {
      if (isEmptyString(memberUUID) || isEmptyString(project.projectID)) {
        throw new Error(
          "Invalid user or project UUID. This may be caused by an internal error."
        );
      }

      setLoading(true);
      const res = await axios.delete(
        `/project/${project.projectID}/team/${memberUUID}`
      );
      if (res.data.err) {
        handleGlobalError(res.data.errMsg);
        return;
      }

      setTeamUserOptions([]);
      onDataChanged();
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submits a PUT request to the server to add the user
   * in state (teamUserToAdd) to the project's team, then
   * refreshes the project data and Addable Users options.
   */
  const submitAddTeamMember = async (uuid: string) => {
    try {
      if (isEmptyString(uuid) || isEmptyString(project.projectID)) {
        throw new Error(
          "Invalid user or project UUID. This may be caused by an internal error."
        );
      }

      setLoading(true);
      const res = await axios.post(`/project/${project.projectID}/team`, {
        uuid: uuid,
      });

      if (res.data.err) {
        handleGlobalError(res.data.errMsg);
        return;
      }

      setTeamUserOptions([]);
      onDataChanged();
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTeamModalList = (projData: Project) => {
    if (!projData) return null;
    let projTeam: ProjectDisplayMember[] = [];
    if (projData.leads && Array.isArray(projData.leads)) {
      projData.leads.forEach((item) => {
        projTeam.push({ ...item, roleValue: "lead", roleDisplay: "Lead" });
      });
    }
    if (projData.liaisons && Array.isArray(projData.liaisons)) {
      projData.liaisons.forEach((item) => {
        projTeam.push({ ...item, roleValue: "liason", roleDisplay: "Liaison" });
      });
    }
    if (projData.members && Array.isArray(projData.members)) {
      projData.members.forEach((item) => {
        projTeam.push({ ...item, roleValue: "member", roleDisplay: "Member" });
      });
    }
    if (projData.auditors && Array.isArray(projData.auditors)) {
      projData.auditors.forEach((item) => {
        projTeam.push({
          ...item,
          roleValue: "auditor",
          roleDisplay: "Auditor",
        });
      });
    }
    projTeam = sortUsersByName(projTeam) as ProjectDisplayMember[];
    return (
      <List divided verticalAlign="middle" className="mb-4p">
        {projTeam.map((item, idx) => {
          return (
            <List.Item key={`team-${idx}`}>
              <div className="flex-row-div">
                <div className="left-flex">
                  <Image avatar src={item.avatar} />
                  <List.Content className="ml-1p">
                    {item.firstName} {item.lastName}
                  </List.Content>
                </div>
                <div className="right-flex">
                  <Dropdown
                    placeholder="Change role..."
                    selection
                    options={projectRoleOptions}
                    value={item.roleValue}
                    loading={loading}
                    onChange={(_e, { value }) =>
                      submitChangeTeamMemberRole(
                        item.uuid,
                        value ? value.toString() : ""
                      )
                    }
                  />
                  <Popup
                    position="top center"
                    trigger={
                      <Button
                        color="red"
                        className="ml-1p"
                        onClick={() => {
                          submitRemoveTeamMember(item.uuid);
                        }}
                        icon
                      >
                        <Icon name="remove circle" />
                      </Button>
                    }
                    content="Remove from project"
                  />
                </div>
              </div>
            </List.Item>
          );
        })}
      </List>
    );
  };

  return (
    <Modal open={show} onClose={onClose} size="large" closeIcon>
      <Modal.Header>Manage Project Team</Modal.Header>
      <Modal.Content scrolling id="project-manage-team-content">
        <Form noValidate>
          <Form.Select
            search
            label="Add Team Member"
            placeholder="Start typing to search. Search by name or email..."
            options={teamUserOptions}
            onChange={(_e, { value }) => {
              submitAddTeamMember(value ? value.toString() : "");
            }}
            onSearchChange={(_e, { searchQuery }) => {
              if (searchQuery) {
                getTeamUserOptionsDebounced(searchQuery);
              }
            }}
            loading={teamUserOptsLoading}
            disabled={teamUserOptsLoading}
          />
          <Button
            fluid
            color="green"
            loading={loading}
            onClick={() => submitAddTeamMember}
          >
            <Icon name="add user" />
            Add Team Member
          </Button>
        </Form>
        <Divider />
        {!loading ? (
          renderTeamModalList(project)
        ) : (
          <Loader active inline="centered" />
        )}
      </Modal.Content>
    </Modal>
  );
};

export default ManageTeamModal;
