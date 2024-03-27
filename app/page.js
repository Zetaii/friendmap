import React from "react"

const LandingPage = () => {
  return (
    <div className="bg-slate-400 min-h-screen flex flex-col">
      <main className="container mx-auto my-8 flex-grow">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ut
            lorem id purus fermentum vestibulum.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          <p>Our company offers a wide range of services to meet your needs.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p>Feel free to contact us for any inquiries or questions.</p>
        </section>
      </main>
      <footer className="bg-blue-500 text-white py-4">
        <div className="container mx-auto">
          <p className="text-center">
            &copy; 2024 Our Website. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
