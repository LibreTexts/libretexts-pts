import { Suspense, useEffect, useState } from "react";
import { useLocation, Switch, Route } from "react-router-dom";
import axios from "axios";
import CommonsAuthor from "./screens/commons/Author";
import CommonsBook from "./screens/commons/Book";
import CommonsCatalog from "./components/commons/CommonsCatalog";
import CommonsCollection from "./screens/commons/Collection";
import CommonsCollections from "./components/commons/CommonsCollections";
import CommonsCollectionView from "./components/commons/CommonsCollectionView";
import CommonsFooter from "./components/commons/CommonsFooter";
import CommonsHomework from "./components/commons/CommonsHomework";
import CommonsJumbotron from "./components/commons/CommonsJumbotron";
import CommonsMenu from "./components/commons/CommonsMenu";
import CommonsNavbar from "./components/commons/CommonsNavbar";
import CommonsProject from "./screens/commons/Project";
import CommonsUnderDevelopment from "./components/commons/CommonsUnderDevelopment";
import CommonsFile from "./screens/commons/File";
import SystemAnnouncement from "./components/util/SystemAnnouncement";
import withUserStateDependency from "./enhancers/withUserStateDependency";
import "./components/commons/Commons.css";
import { useTypedSelector } from "./state/hooks";
import { Announcement } from "./types";
import LoadingSpinner from "./components/LoadingSpinner";
import useSystemAnnouncement from "./hooks/useSystemAnnouncement";

/**
 * The public-facing catalog and showcase application.
 */
const Commons = () => {
  // Global State and Location
  const location = useLocation();
  const org = useTypedSelector((state) => state.org);
  const user = useTypedSelector((state) => state.user);
  const { sysAnnouncement } = useSystemAnnouncement();
  const LAUNCHPAD_URL = "https://one.libretexts.org/launchpad";

  // Menu state
  const [activeItem, setActiveItem] = useState("");

  /**
   * Subscribe to changes to location and update the Menu with the active page.
   */
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("/collection")) {
      setActiveItem("collections");
    } else if (currentPath.includes("/homework")) {
      setActiveItem("homework");
    } else if (currentPath.includes("/libraries")) {
      window.location.href = LAUNCHPAD_URL; // Redirects to the LibreTexts Launchpad.
    } else if (currentPath.includes("/underdevelopment")) {
      setActiveItem("underdevelopment");
    } else {
      setActiveItem("catalog");
    }
  }, [location.pathname]);

  return (
    <div className="commons">
      <CommonsNavbar org={org} user={user} />
      <CommonsJumbotron backgroundURL={org.coverPhoto ?? ""} />
      <CommonsMenu activeItem={activeItem} />
      {sysAnnouncement && (
        <SystemAnnouncement
          title={sysAnnouncement.title}
          message={sysAnnouncement.message}
        />
      )}
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route exact path="/" component={CommonsCatalog} />
          <Route exact path="/catalog" component={CommonsCatalog} />
          <Route exact path="/collections/:id?" component={CommonsCollection} />
          {org.orgID === "libretexts" && [
            <Route
              exact
              path="/homework"
              key="homework"
              component={CommonsHomework}
            />,
            <Route
              exact
              path="/underdevelopment"
              key="underdev"
              component={CommonsUnderDevelopment}
            />,
          ]}
          <Route exact path="/author/:id" component={CommonsAuthor} />
          <Route exact path="/book/:id" component={CommonsBook} />
          <Route exact path="/commons-project/:id" component={CommonsProject} />
          <Route
            exact
            path="/file/:projectID/:fileID"
            component={CommonsFile}
          />
        </Switch>
      </Suspense>
      <CommonsFooter />
    </div>
  );
};

export default withUserStateDependency(Commons);
