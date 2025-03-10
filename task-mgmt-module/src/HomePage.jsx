import React from "react";
import { Link } from "react-router-dom";
import audit from "./assets/AuditLogPic.jpeg";
import agentview from "./assets/AgentView.jpeg";
import sla from "./assets/SLAView.jpeg";

const views = [
  { id: 1, name: "Activity Logs", path: "/view-1", image: audit },
  { id: 2, name: "Agent Tracking", path: "/view-2", image: agentview },
  { id: 3, name: "SLA Monitoring", path: "/view-3", image: sla }
];

const HomePage = () => {
  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b-4 border-blue-500 pb-2">
        Task Management Module
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-100">
        {views.map((view) => (
          <Link
            to={view.path}
            key={view.id}
            className="bg-white shadow-lg rounded-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
          >
            <img src={view.image} alt={view.name} className="w-full h-40 object-cover" />
            <div className="p-5 text-center">
              <h2 className="text-2xl font-semibold text-gray-800">{view.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;

