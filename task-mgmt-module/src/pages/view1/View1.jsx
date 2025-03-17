import React from "react";
import { Link } from "react-router-dom";

const View1 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">Welcome to View 1</h1>
      <p className="text-lg text-gray-700 mt-4">This is a sample page for View 1.</p>

      <Link to="/" className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
        Go Back to Home hi
      </Link>
    </div>
  );
};

export default View1;
