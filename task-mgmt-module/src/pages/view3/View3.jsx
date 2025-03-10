import React from "react";
import { Link } from "react-router-dom";

const View3 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">Welcome to View 3</h1>
      <p className="text-lg text-gray-700 mt-4">This is a sample page for View 3.</p>

      <Link to="/" className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
        Go Back to Home
      </Link>
    </div>
  );
};

export default View3;
