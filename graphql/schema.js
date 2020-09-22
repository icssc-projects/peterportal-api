const { graphqlHTTP } = require('express-graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLList
} = require('graphql');

const courses_cache = require('../cache/parsed_courses_cache.json');
const professors_cache = require('../cache/professors_cache.json');


const professorType = new GraphQLObjectType({
  name: 'Professor',
  fields: {
    name: { type: GraphQLString }
  }
});

const courseType = new GraphQLObjectType({
  name: 'Course',

  // fields must match schema from database
  // In this case, we're using a .json cache
  fields: {
    id: { type: GraphQLString },
    id_department: { type: GraphQLString },
    id_number: { type: GraphQLString },
    id_school: { type: GraphQLString },
    name: { type: GraphQLString },
    course_level: { type: GraphQLString },
    dept_alias: { type: GraphQLList(GraphQLString) },
    units: { type: GraphQLList(GraphQLFloat) },
    description: { type: GraphQLString },
    department: { type: GraphQLString },
    professorHistory: { type: GraphQLList(GraphQLString) },
    prerequisiteJSON: { type: GraphQLString },
    prerequisiteList: { type: GraphQLList(GraphQLString) },
    prerequisite: { type: GraphQLString },
    dependencies: { type: GraphQLList(GraphQLString) },
    repeatability: { type: GraphQLString },
    concurrent: { type: GraphQLString },
    restriction: { type: GraphQLString },
    overlaps: { type: GraphQLString },
    corequisite: { type: GraphQLString },
    ge_types: { type: GraphQLList(GraphQLString) },
    ge_string: { type: GraphQLString },
    terms: { type: GraphQLList(GraphQLString) }
    // can't add "same as" or "grading option" due to whitespace :((
  }
});


const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () =>  ({

    // query course by ID
    course: {
      type: courseType,

      // specify args to query by
      args: {
        id: { type: GraphQLString }
      },

      // define function to get a course
      resolve: (_, {id}) => {
        return courses_cache[id];
      }
    },

    // get professor by ucinetid
    professor: {
      type: professorType,

      // specify args to query by (ucinetid)
      args: {
        ucinetid: { type: GraphQLString }
      },

      // define function to get a professor
      resolve: (_, {ucinetid}) => {
        for (prof of professors_cache["hits"]["hits"]){
          if (prof["_id"] == ucinetid){
            return prof["_source"];
          }
        }
      }
    },



    allCourses: {
      type: GraphQLList(courseType),

      resolve: () => {
        var coursesArr = []
        for (var courseId in courses_cache){
          coursesArr.push(courses_cache[courseId]);
        }
        return coursesArr;


      }
    }
  })
});


const schema = new GraphQLSchema({query: queryType});

module.exports = {schema};

/*
Example:
  query {
    allCourses{
      id
      name
      department
      units
      description
      department
      professorHistory
      prerequisiteJSON
      prerequisiteList
      prerequisite
      dependencies
      repeatability
      concurrent
      restriction
      overlaps
      corequisite
      ge_types
      ge_string
      terms
    }
  }

"hits":[{"_index":"professors","_type":"_doc","_id":"kakagi","_score":1,"_source":{"name":"Kei Akagi","ucinetid":"kakagi",
  "phone":"(949) 824-2171","title":"Chancellor's Professor","department":"Arts-Music","schools":["Claire Trevor School of the Arts"]
*/