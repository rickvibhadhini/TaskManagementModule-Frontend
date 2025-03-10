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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-8">
      <div className="w-[90vw] max-w-[90vw] h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col items-center justify-center p-10">
        {/* Header */}
        <header className="w-full text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Task Management Module
          </h1>
          <p className="text-lg text-gray-700">
            Choose a view to get started
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {views.map((view) => (
            <Link
              to={view.path}
              key={view.id}
              className="relative bg-gray-100 rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={view.image}
                alt={view.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <h2 className="text-3xl text-white font-semibold">{view.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
