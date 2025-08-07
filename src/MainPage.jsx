import React from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-4">
          Welcome to Jewelry Order System
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your custom jewelry orders with ease
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          to="/new-order"
          className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-indigo-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">New Order</h2>
          <p className="text-gray-500 mt-2">Create a new jewelry order</p>
        </Link>
        <Link
          to="/settlement"
          className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-indigo-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.5 3.5 0 115.33 4.606L12 14.5l-1.165-5.197a3.5 3.5 0 115.33-4.606z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">Settlement</h2>
          <p className="text-gray-500 mt-2">View and manage ongoing and completed orders</p>
        </Link>
      </div>
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Jewelry Order System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MainPage;