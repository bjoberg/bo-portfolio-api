'use strict';

const httpStatus  = require('http-status');
const omitBy = require('lodash').omitBy;
const isNil = require('lodash').isNil;

module.exports = (sequelize, DataTypes) => {
  const groupTag = sequelize.define('groupTag', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: true
      }
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      },
      validate: {
        isUUID: 4,
        notEmpty: true
      }
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'id'
      },      
      validate: {
        isUUID: 4,
        notEmpty: true
      }
    }
  }, {});

  groupTag.associate = function(models) {
    // associations can be defined here
  };

  /**
   * Get all of the groupTags that match a certain query
   * @param {Object} json object with properties to query with
   * @returns all of the groupTags containing the specified query items
   * @throws error if query fails
   */
  groupTag.list = async ({page, limit, groupId, tagId}) => {
    try {
      const options = omitBy({
        groupId, tagId
      }, isNil);
  
      const getAllOptions = {
        where: options
      };
  
      if (page && limit) {
        getAllOptions.offset = page * limit;
        getAllOptions.limit = limit;
      } else {
        getAllOptions.page = 0;
        getAllOptions.limit = 30;
      };
  
      return groupTag.findAll(getAllOptions); 
    } catch (error) {
      throw {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching groupTags.`
      };
    }
  };

  /**
   * Try and find a group by its id.
   * @param {string} id of the group being searched for
   * @returns group item
   * @throws error if query fails
   */
  groupTag.get = async (id) => {
    try {
      let item = await groupTag.findOne({
        where: {
          id: id
        }
      });
      
      if (item) return item;
  
      throw {
        status: httpStatus.NOT_FOUND,
        message: `groupTag, ${id}, deleted or does not exist.`
      };
    } catch (error) {
      throw error;
    }
  };  

  return groupTag;
};