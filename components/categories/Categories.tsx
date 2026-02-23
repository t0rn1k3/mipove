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
    <section className="">
      <div className="">
        {/* Heading */}
        <h2 className="">Discover Craftsmanship</h2>
        <p className="">
          Connect with skilled artisans across various disciplines
        </p>

        {/* Cards */}
        <div className="">
          {items.map((item) => (
            <div key={item.title} className="">
              <div className="">
                {/* Placeholder icon circle */}
                <div className="" />
              </div>

              <h3 className="">{item.title}</h3>

              <p className="">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
