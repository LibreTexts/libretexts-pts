import { useState, useEffect, lazy } from "react";
import { useLocation, useParams } from "react-router-dom";
import useGlobalError from "../../../components/error/ErrorHooks";
import DefaultLayout from "../../../components/kb/DefaultLayout";
import { SupportTicket } from "../../../types";
import axios from "axios";
import TicketStatusLabel from "../../../components/support/TicketStatusLabel";
import TicketMessaging from "../../../components/support/TicketMessaging";
import { useTypedSelector } from "../../../state/hooks";
import { Button, Icon, Label } from "semantic-ui-react";
import TicketDetails from "../../../components/support/TicketDetails";
import TicketFeed from "../../../components/support/TicketFeed";
import { isSupportStaff } from "../../../utils/supportHelpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TicketInternalMessaging from "../../../components/support/TicketInternalMessaging";
import TicketAttachments from "../../../components/support/TicketAttachments";
import ConfirmDeleteTicketModal from "../../../components/support/ConfirmDeleteTicketModal";
import api from "../../../api";
const AssignTicketModal = lazy(
  () => import("../../../components/support/AssignTicketModal")
);

const getIdFromURL = (url: string) => {
  if (!url) return "";
  if (url.includes("?")) url = url.split("?")[0];
  const id = url.split("/").pop();
  return id ? id : "";
};

const SupportTicketView = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { handleGlobalError } = useGlobalError();
  const user = useTypedSelector((state) => state.user);

  const [id, setId] = useState<string>("");
  const [accessKey, setAccessKey] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "LibreTexts | Support Ticket";
  }, []);

  useEffect(() => {
    const id = getIdFromURL(location.pathname);
    setId(id);
    const searchParams = new URLSearchParams(location.search);
    const accessKey = searchParams.get("accessKey");
    if (accessKey) {
      setAccessKey(accessKey);
    }
  }, [location.search, location.pathname]);

  const { data: ticket, isFetching } = useQuery<SupportTicket>({
    queryKey: ["ticket", id],
    queryFn: () => loadTicket(),
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const updateTicketMutation = useMutation({
    mutationFn: (status: "open" | "in_progress" | "closed") =>
      updateTicket(status),
    onSuccess: () => {
      queryClient.invalidateQueries(["ticket", id]);
      queryClient.invalidateQueries(["supportMetrics"]);
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: () => deleteTicket(),
    onSuccess: () => {
      window.location.href = "/support/dashboard";
      queryClient.invalidateQueries(["ticket"]);
      queryClient.invalidateQueries(["supportMetrics"]);
    },
  });

  async function loadTicket() {
    try {
      if (typeof id !== "string" || !id) {
        throw new Error("Invalid ticket ID");
      }
      const res = await axios.get(`/support/ticket/${id}`, {
        params: {
          ...(accessKey && { accessKey }),
        },
      });

      if (res.data.err) {
        throw new Error(res.data.errMsg);
      }
      if (!res.data.ticket) {
        throw new Error("Invalid response from server");
      }
      return res.data.ticket;
    } catch (err: any) {
      // Redirect to login if not authenticated or guest access key is invalid
      if (err.response?.status === 401) {
        const redirectURI = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        const params = new URLSearchParams({ redirectURI });
        window.location.href = `/login?${params.toString()}`;
        return;
      }
      handleGlobalError(err);
    }
  }

  async function updateTicket(status: "open" | "in_progress" | "closed") {
    try {
      if (typeof id !== "string" || !id) {
        throw new Error("Invalid ticket ID");
      }

      setLoading(true);
      const res = await axios.patch(`/support/ticket/${id}`, {
        ...ticket,
        status,
      });

      if (res.data.err) {
        throw new Error(res.data.errMsg);
      }
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTicket() {
    try {
      setLoading(true);
      if (!id) return;

      const res = await api.deleteTicket(id);
      if (res.data.err) {
        throw new Error(res.data.errMsg);
      }
    } catch (err) {
      handleGlobalError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseAssignModal() {
    setShowAssignModal(false);
    queryClient.invalidateQueries(["ticket", id]);
  }

  function handleOnDeleteTicket() {
    setShowDeleteModal(false);
    deleteTicketMutation.mutateAsync();
  }

  const AdminOptions = () => (
    <div className="flex flex-row">
      {ticket?.status === "open" && (
        <Button
          color="red"
          onClick={() => setShowDeleteModal(true)}
          loading={loading || isFetching}
        >
          <Icon name="trash" />
          Delete Ticket
        </Button>
      )}
      {["open", "in_progress"].includes(ticket?.status ?? "") && (
        <>
          <Button
            color="blue"
            onClick={() => setShowAssignModal(true)}
            loading={loading || isFetching}
          >
            <Icon name="user plus" />
            {ticket?.assignedUUIDs && ticket?.assignedUUIDs?.length > 0
              ? "Re-Assign"
              : "Assign"}{" "}
            Ticket
          </Button>
          <Button
            color="green"
            onClick={() => updateTicketMutation.mutateAsync("closed")}
            loading={loading || isFetching}
          >
            <Icon name="check" />
            Mark as Resolved
          </Button>
        </>
      )}
      {ticket?.status === "closed" && (
        <Button
          color="orange"
          onClick={() => updateTicketMutation.mutateAsync("in_progress")}
          loading={loading || isFetching}
        >
          <Icon name="undo" />
          Re-Open Ticket
        </Button>
      )}
    </div>
  );

  return (
    <DefaultLayout altBackground>
      <div aria-busy={isFetching} className="px-8 pt-8">
        {ticket && (
          <>
            <div className="flex flex-row w-full justify-between">
              <div className="flex flex-row items-center">
                <p className="text-3xl font-semibold">
                  Support Ticket: #{ticket?.uuid.slice(-7)}
                </p>
                <TicketStatusLabel status={ticket.status} className="!ml-4" />
              </div>
              {isSupportStaff(user) && <AdminOptions />}
            </div>
            <div className="flex flex-col xl:flex-row-reverse w-full mt-4">
              <div className="flex flex-col xl:basis-2/5 xl:pl-4">
                <TicketDetails ticket={ticket} />
                <div className="mt-4">
                  <TicketFeed ticket={ticket} />
                </div>
                {isSupportStaff(user) && (
                  <div className="my-4">
                    <TicketInternalMessaging id={id} />
                  </div>
                )}
              </div>
              <div className="flex flex-col xl:basis-3/5 mt-4 xl:mt-0">
                <TicketMessaging
                  id={id}
                  guestAccessKey={accessKey}
                  ticket={ticket}
                />
                <div className="mt-4">
                  <TicketAttachments ticket={ticket} guestAccessKey={accessKey} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {user && user.uuid && isSupportStaff(user) && (
        <>
          <AssignTicketModal
            open={showAssignModal}
            onClose={handleCloseAssignModal}
            ticketId={id}
          />
          <ConfirmDeleteTicketModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            uuid={id}
            onConfirmDelete={handleOnDeleteTicket}
          />
        </>
      )}
    </DefaultLayout>
  );
};

export default SupportTicketView;
