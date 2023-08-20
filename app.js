const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const instializeAndConnectDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is Running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`Db Error: ${(e, message)}`);
    process.exit(1);
  }
};

instializeAndConnectDb();

function convertMovieObjectToArray(object) {
  return {
    movieName: object.movie_name,
  };
}
function covertSingleMovieObjectTOArray(object) {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
}

//List Of movies
app.get("/movies/", async (request, response) => {
  const allMovies = `SELECT * FROM movie order by movie_id;`;
  const getAll = await db.all(allMovies);
  response.send(
    getAll.map((eachItem) => {
      return convertMovieObjectToArray(eachItem);
    })
  );
});

//Creating New Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
    INSERT INTO movie(director_id, movie_name, lead_actor) VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;

  const addingMovie = await db.run(addMovie);
  const addingId = addingMovie.lastID;
  response.send(`Movie Successfully Added`);
});

//GET Movie By ID
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const movie = await db.get(getMovie);
  const result = covertSingleMovieObjectTOArray(movie);

  response.send(result);
});

//Update Movie By ID

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovie = `
  UPDATE movie 
  set director_id = ${directorId}, movie_name = '${movieName}',
  lead_actor='${leadActor}' where movie_id=${movieId}`;

  await db.run(updateMovie);

  response.send(`Movie Details Updated`);
});

//Delete Movie By ID
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `Delete from movie where movie_id = ${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

function convertDirectorObjectToArray(object) {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
}

//GET Director list from director table
app.get("/directors/", async (request, response) => {
  const directorsList = `select * from director order by director_id;`;
  const directorObject = await db.all(directorsList);
  response.send(
    directorObject.map((eachDirector) => {
      return convertDirectorObjectToArray(eachDirector);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesList = `select * from movie where director_id=${directorId};`;
  const resultQuery = await db.all(moviesList);
  response.send(
    resultQuery.map((eachMovie) => {
      return convertMovieObjectToArray(eachMovie);
    })
  );
});
module.exports = app;
