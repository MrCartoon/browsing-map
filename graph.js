let Graph;

chrome.storage.local.get(["links"], function (result) {
  let links = result.links;

  // Transform the links object into the format expected by ForceGraph3D().graphData()
  let nodes = [];
  let transformedLinks = [];

  for (let source in links) {
    nodes.push({ id: source, type: "source" });
  }

  for (let source in links) {
    links[source].forEach((target) => {
      // Check if a node with the same id already exists
      if (!links[target]) {
        nodes.push({ id: target, type: "target" });
      }
      transformedLinks.push({ source: source, target: target });
    });
  }

  if (Graph) {
    Graph.dispose();
  }
  Graph = ForceGraph3D()(document.getElementById("3d-graph"))
    .graphData({ nodes: nodes, links: transformedLinks })
    .nodeColor((node) =>
      node.type === "source"
        ? "rgba(255, 255, 255, 1)"
        : "rgba(255, 255, 255, 0.2)"
    )
    .linkDirectionalParticles("value")
    .onNodeHover((node) => {
      if (node) {
        document.getElementById(
          "info"
        ).textContent = `Node: ${node.type} ${node.id}`;
        document.getElementById("3d-graph").style.cursor = "grab";
      } else {
        document.getElementById("info").textContent = "";
        document.getElementById("3d-graph").style.cursor = "default";
      }
    });
});
