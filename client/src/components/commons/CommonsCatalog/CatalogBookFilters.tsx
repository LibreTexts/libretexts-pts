import { Checkbox, Dropdown } from "semantic-ui-react";
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import axios from "axios";
import { BookFilters, GenericKeyTextValueObj } from "../../../types";
import useGlobalError from "../../error/ErrorHooks";
import { catalogLocationOptions } from "../../util/CatalogOptions";
import api from "../../../api";
import { libraryOptions } from "../../util/LibraryOptions";

type CatalogBookFiltersRef = {};

const CatalogBookFilters = forwardRef(
  (
    props: {
      strictMode?: boolean;
      onStrictModeChange?: (strictMode: boolean) => void;
      selectedFilters: BookFilters;
      setSelectedFilters: (filters: BookFilters) => void;
    },
    ref: ForwardedRef<CatalogBookFiltersRef>
  ) => {
    const { selectedFilters, setSelectedFilters } = props;
    const MENU_CLASSES = "max-w-sm max-h-52 overflow-y-auto overflow-x-clip";
    const { handleGlobalError } = useGlobalError();

    const [subjectOptions, setSubjectOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [locationOptions, setLocationOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >(catalogLocationOptions);
    const [licenseOptions, setLicenseOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [authorOptions, setAuthorOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [courseOptions, setCourseOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [pubOptions, setPubOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [affOptions, setAffOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [cidOptions, setCIDOptions] = useState<
      GenericKeyTextValueObj<string>[]
    >([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      getFilterOptions();
      getLicenseOptions();
    }, []);

    /**
     * Retrieve the list(s) of dynamic
     * filter options from the server.
     */
    async function getFilterOptions() {
      try {
        setLoading(true);

        const res = await axios.get("/commons/filters");
        if (res.data.err) {
          throw new Error(res.data.errMsg);
        }
        const newAuthorOptions = [
          { key: "empty", text: "Clear...", value: "" },
        ];
        const newSubjectOptions = [
          { key: "empty", text: "Clear...", value: "" },
        ];
        const newAffOptions = [{ key: "empty", text: "Clear...", value: "" }];
        const newCourseOptions = [
          { key: "empty", text: "Clear...", value: "" },
        ];
        const newPubOptions = [{ key: "empty", text: "Clear...", value: "" }];
        const newCIDOptions = [{ key: "empty", text: "Clear...", value: "" }];

        if (res.data.authors && Array.isArray(res.data.authors)) {
          res.data.authors.forEach((author: string) => {
            newAuthorOptions.push({
              key: author,
              text: author,
              value: author,
            });
          });
        }
        if (res.data.subjects && Array.isArray(res.data.subjects)) {
          res.data.subjects.forEach((subject: string) => {
            newSubjectOptions.push({
              key: subject,
              text: subject,
              value: subject,
            });
          });
        }
        if (res.data.affiliations && Array.isArray(res.data.affiliations)) {
          res.data.affiliations.forEach((affiliation: string) => {
            newAffOptions.push({
              key: affiliation,
              text: affiliation,
              value: affiliation,
            });
          });
        }
        if (res.data.courses && Array.isArray(res.data.courses)) {
          res.data.courses.forEach((course: string) => {
            newCourseOptions.push({
              key: course,
              text: course,
              value: course,
            });
          });
        }
        if (res.data.publishers && Array.isArray(res.data.publishers)) {
          res.data.publishers.forEach((publisher: string) => {
            newPubOptions.push({
              key: publisher,
              text: publisher,
              value: publisher,
            });
          });
        }
        if (Array.isArray(res.data.cids)) {
          res.data.cids.forEach((descriptor: string) => {
            newCIDOptions.push({
              key: descriptor,
              text: descriptor,
              value: descriptor,
            });
          });
        }

        setAuthorOptions(newAuthorOptions);
        setSubjectOptions(newSubjectOptions);
        setAffOptions(newAffOptions);
        setCourseOptions(newCourseOptions);
        setPubOptions(newPubOptions);
        setCIDOptions(newCIDOptions);
      } catch (err) {
        handleGlobalError(err);
      } finally {
        setLoading(false);
      }
    }

    async function getLicenseOptions() {
      try {
        setLoading(true);

        const res = await api.getCentralIdentityLicenses();
        if (res.data.err) {
          throw new Error(res.data.errMsg);
        }
        const newLicenseOptions: typeof licenseOptions = [
          { key: "empty", text: "Clear...", value: "" },
        ];

        if (!res.data.licenses || !Array.isArray(res.data.licenses)) {
          throw new Error("Invalid response from server.");
        }

        const noDuplicates = new Set<string>();
        res.data.licenses.forEach((license) => {
          noDuplicates.add(license.name);
        });

        noDuplicates.forEach((licenseName) => {
          newLicenseOptions.push({
            key: crypto.randomUUID(),
            text: licenseName,
            value: licenseName,
          });
        });

        // const reduced = res.data.licenses.reduce((acc: any, curr: any) => {
        //   if (Array.isArray(curr.versions) && curr.versions.length > 0) {
        //     acc.push(curr);
        //     curr.versions.forEach((version: any) => {
        //       const newObj = { ...curr, version };
        //       delete newObj.versions;
        //       acc.push(newObj);
        //     });
        //   } else {
        //     acc.push(curr);
        //   }
        //   return acc;
        // }, []);

        setLicenseOptions(newLicenseOptions);
      } catch (err) {
        handleGlobalError(err);
      } finally {
        setLoading(false);
      }
    }

    // const handleLocationChange = (value: string) => {
    //   const found = selectedFilters.location?.find((loc) => loc === value);
    //   if (found) {
    //     setSelectedFilters({
    //       ...selectedFilters,
    //       location: selectedFilters.location?.filter((loc) => loc !== value),
    //     });
    //     return;
    //   }
    //   setSelectedFilters({
    //     ...selectedFilters,
    //     location: [...(selectedFilters.location ?? []), value],
    //   });
    // };

    return (
      <div
        aria-busy={loading}
        className="flex flex-row w-full justify-between items-center"
      >
        <div className="flex flex-row mt-2 mb-4 flex-wrap items-center gap-y-2 ">
          <Dropdown
            text={
              selectedFilters.library
                ? `Library - ${selectedFilters.library}`
                : "Library"
            }
            icon="university"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {libraryOptions.map((library) => (
                <Dropdown.Item
                  key={library.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      library: library.value,
                    })
                  }
                >
                  {library.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.subject
                ? `Subject - ${selectedFilters.subject}`
                : "Subject"
            }
            icon="filter"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {subjectOptions.map((subject) => (
                <Dropdown.Item
                  key={subject.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      subject: subject.value,
                    })
                  }
                >
                  {subject.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.location
                ? `Location - ${selectedFilters.location}`
                : "Location"
            }
            icon="globe"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {locationOptions.map((location) => (
                <Dropdown.Item
                  key={location.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      location: location.value,
                    })
                  }
                >
                  {location.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.license
                ? `License - ${selectedFilters.license}`
                : "License"
            }
            icon="legal"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {licenseOptions.map((license) => (
                <Dropdown.Item
                  key={license.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      license: license.value,
                    })
                  }
                >
                  {license.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.author
                ? `Author - ${selectedFilters.author}`
                : "Author"
            }
            icon="user"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {authorOptions.map((author) => (
                <Dropdown.Item
                  key={author.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      author: author.value,
                    })
                  }
                >
                  {author.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.course
                ? `Course - ${selectedFilters.course}`
                : "Course"
            }
            icon="users"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {courseOptions.map((course) => (
                <Dropdown.Item
                  key={course.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      course: course.value,
                    })
                  }
                >
                  {course.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown
            text={
              selectedFilters.affiliation
                ? `Affiliation - ${selectedFilters.affiliation}`
                : "Affiliation"
            }
            icon="filter"
            floating
            labeled
            button
            className="icon"
            loading={loading}
            basic
          >
            <Dropdown.Menu className={MENU_CLASSES}>
              {affOptions.map((affiliation) => (
                <Dropdown.Item
                  key={affiliation.key}
                  onClick={() =>
                    setSelectedFilters({
                      ...selectedFilters,
                      affiliation: affiliation.value,
                    })
                  }
                >
                  {affiliation.text}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
);

export default CatalogBookFilters;
