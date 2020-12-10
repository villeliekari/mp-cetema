import haversine from "haversine";

export const withinRadius = (start, end, radius) => {
  //console.log("withinRadius, meters", haversine(start, end) * 1000)
  return haversine(start, end) < radius;
};
