"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import { getToken } from "@/actions/auth.actions";
import Logout from "./shared/Logout";
import Link from "next/link";

const getHaInformation = async (
  grabAllInfo: boolean,
  congregationID: number,
  periodID?: number
) => {
  // console.log(onlyMyTickets)

  return await axios({
    method: "post",
    url: "https://my.pureheart.org/ministryplatformapi/procs/PHCGetHaMinistryQuestionInfo",
    data: {
      "@GrabAllInfo": grabAllInfo,
      "@CongregationID": congregationID,
      "@PeriodID": periodID,
    },
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "Application/JSON",
    },
  }).then((response) => response.data);
};

interface userProps {
  userid: number;
}

interface CongregationsProps {
  Congregation_ID: number;
  Congregation_Name: string;
}
interface SectionsProps {
  Question_Section_ID: number;
  Question_Section: string;
}
interface CategoriesProps {
  Question_Section_ID: number;
  Question_Category: string;
  Question_Category_ID: number;
}
interface MonthsProps {
  Fiscal_Period_ID: number;
  Fiscal_Period_Start: string;
  _Fiscal_Period_End: string;
  _Fiscal_Period_Name: string;
  _Fiscal_Period_Complete: number;
  _Sundays: number;
  Fiscal_Year_ID: number;
}

interface QuestionDataProps {
  Question_Header: string;
  Last_Months_Value: number;
  Last_Years_Value: number;
  Ministry_Question_ID: number;
  Question_Category_ID: number;
}

const Ha = () => {
  // const daysBack = 365
  const [congregation, setCongregation] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Access localStorage in the browser
      const congregationId = parseInt(
        localStorage.getItem("Congregation_ID") || "0"
      );
      setCongregation(congregationId);
    }
  }, []);

  const [user, setUser] = useState<userProps>();
  const [sections, setSections] = useState<SectionsProps[]>();
  const [questionData, setQuestionData] = useState<QuestionDataProps[]>([]);
  const [congregations, setCongregations] = useState<CongregationsProps[]>();
  const [categories, setCategories] = useState<CategoriesProps[]>([]);
  const [months, setMonths] = useState<MonthsProps[]>();
  const [selectedMonth, setSelectedMonth] = useState<MonthsProps>();
  const [congregationID, setCongregationID] = useState(congregation);

  useEffect(() => {
    const cookieUser = JSON.parse(Cookies.get("user") || "{}");
    if (cookieUser !== "") {
      setUser(cookieUser);
    }
  }, []);

  // Use firstDayOfMonth as needed
  useEffect(() => {
    if (user?.userid) {
      getHaInformation(true, congregationID)
        .then((data) => {
          const [
            sectionData,
            questionData,
            congregationData,
            categoryData,
            monthData,
          ] = data;

          setSections(sectionData);
          setQuestionData(questionData);
          setCongregations(congregationData);
          setCategories(categoryData);
          setMonths(monthData);
          setSelectedMonth(monthData[0]);
        })
        .catch((err) => {
          console.log(err); //remove this in production but it's usefull for now
        });
    }
  }, [user, congregationID]);

  useEffect(() => {
    if (user?.userid && selectedMonth) {
      getHaInformation(false, congregationID, selectedMonth.Fiscal_Period_ID)
        .then((data) => {
          const [qData] = data;
          setQuestionData(qData);
        })
        .catch((err) => {
          console.log(err); // Keep this for debugging
        });
    }
  }, [congregationID, user, selectedMonth]);

  const handleChange = (e: any) => {
    setCongregationID(parseInt(e.target.value));
    localStorage.setItem("Congregation_ID", JSON.stringify(e.target.value));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 p-4 justify-between">
        <Logout />
        <div className="flex justify-end">
          <select
            name="congregationSelect"
            id="congregationSelect"
            value={congregationID}
            onChange={handleChange}
          >
            {congregations?.map((congregation, index) => {
              return (
                <option key={index} value={congregation.Congregation_ID}>
                  {congregation.Congregation_Name}
                </option>
              );
            })}
          </select>
          {selectedMonth && (
            <select
              name="monthSelect"
              id="monthSelect"
              onChange={(e) =>
                setSelectedMonth(
                  months?.find(
                    (month) =>
                      month.Fiscal_Period_ID === parseInt(e.target.value)
                  )
                )
              }
            >
              {months?.map((month, k) => {
                return (
                  <option key={k} value={month.Fiscal_Period_ID}>
                    {new Date(month.Fiscal_Period_Start).toLocaleDateString(
                      "en-us",
                      { month: "short", year: "numeric" }
                    )}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      </div>
      {sections?.map((section, l) => {
        return (
          <div className="flex flex-col flex-wrap items-center w-auto" key={l}>
            <h2 className="text-xl font-extrabold text-red-brand">
              {section.Question_Section}
            </h2>
            <div className="flex flex-warp gap-8">
              {categories
                .filter(
                  (category) =>
                    category.Question_Section_ID === section.Question_Section_ID
                )
                .map((category, i) => {
                  const { Question_Category, Question_Category_ID } = category;
                  return (
                    <div
                      className="flex flex-col items-center p-4 border-2 rounded-lg bg-slate-50 shadow-md mb-8"
                      key={i}
                    >
                      <h2 className=" text-lg font-bold">
                        {Question_Category}
                      </h2>
                      <table cellSpacing="5">
                        <tbody>
                          <tr className="text-lg font-normal">
                            <th className="pl-6">Question Header</th>
                            <th className="pl-6">Months Value</th>
                            <th className="pl-6">Previous Years Value</th>
                            <th className="pl-6">% Difference</th>
                          </tr>
                          {questionData
                            .filter(
                              (question) =>
                                question.Question_Category_ID ===
                                Question_Category_ID
                            )
                            .map((question, j) => {
                              const {
                                Question_Header,
                                Last_Months_Value,
                                Last_Years_Value,
                                Ministry_Question_ID,
                              } = question;
                              return (
                                (Last_Years_Value !== null ||
                                  Last_Months_Value !== null) && (
                                  <tr
                                    className=" border-b border-black "
                                    key={j}
                                  >
                                    <th className=" text-left font-semibold">
                                      <Link
                                        href={`/ha/${Ministry_Question_ID}`}
                                      >
                                        {Question_Header}
                                      </Link>
                                    </th>
                                    <td className="text-right">
                                      {Last_Months_Value}
                                    </td>
                                    <td className="text-right">
                                      {Last_Years_Value}
                                    </td>
                                    <td className="text-right">
                                      {(
                                        ((Last_Months_Value -
                                          Last_Years_Value) /
                                          Last_Years_Value) *
                                        100
                                      ).toFixed(2)}
                                      %
                                    </td>
                                  </tr>
                                )
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ha;
