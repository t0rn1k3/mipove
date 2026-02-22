export default function Categories() {
  const items = [
    {
      title: "Painting",
      description: "Expert painters bringing visions to canvas",
    },
    {
      title: "Sculpture",
      description: "Master sculptors crafting timeless pieces",
    },
    {
      title: "Textiles",
      description: "Skilled artisans weaving tradition",
    },
    {
      title: "Restoration",
      description: "Preserving art with precision",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-4xl font-serif font-semibold mb-4">
          Discover Craftsmanship
        </h2>
        <p className="text-gray-600 mb-16">
          Connect with skilled artisans across various disciplines
        </p>

        {/* Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <div className="w-14 h-14 mb-6 mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-teal-600">
                {/* Placeholder icon circle */}
                <div className="w-6 h-6 bg-teal-500 rounded-full" />
              </div>

              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
