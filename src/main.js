const canvas = document.getElementById("game");
const status = document.getElementById("status");

if (typeof window.Matter === "undefined") {
  status.textContent = "Physics engine failed to load.";
} else {
  start();
}

function start() {
  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = window.Matter;

  const engine = Engine.create();
  const render = Render.create({
    canvas,
    engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      wireframes: false,
      background: "#12121a",
    },
  });

  const ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 30,
    window.innerWidth,
    60,
    { isStatic: true, render: { fillStyle: "#2a2a3a" } },
  );
  const marble = Bodies.circle(window.innerWidth / 2, 80, 24, {
    restitution: 0.7,
    friction: 0.01,
    render: { fillStyle: "#4ade80" },
  });

  Composite.add(engine.world, [ground, marble]);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2 },
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Render.run(render);
  Runner.run(Runner.create(), engine);

  let groundWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    render.options.width = width;
    render.options.height = height;
    render.canvas.width = width;
    render.canvas.height = height;
    window.Matter.Body.scale(ground, width / groundWidth, 1);
    window.Matter.Body.setPosition(ground, { x: width / 2, y: height - 30 });
    groundWidth = width;
  });

  status.textContent = `matter-js ${window.Matter.version} ready`;
  window.__game = { engine, render };
}
