'use strict';

const httpStatus  = require('http-status');
const omitBy = require('lodash').omitBy;
const isNil = require('lodash').isNil;

module.exports = (sequelize, DataTypes) => {
  const imageTag = sequelize.define('imageTag', {
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
    imageId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'images',
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

  imageTag.associate = function(models) {
    // associations can be defined here
  };

  /**
   * Get all of the imageTags that match a certain query
   * @param {Object} json object with properties to query with
   * @returns all of the imageTags containing the specified query items
   * @throws error if query fails
   */
  imageTag.list = async ({page, limit, imageId, tagId}) => {
    try {
      const options = omitBy({
        imageId, tagId
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
  
      return imageTag.findAll(getAllOptions); 
    } catch (error) {
      throw {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching imageTags.`
      };
    }
  };

  /**
   * Try and find an imageTag by its id.
   * @param {string} id of the imageTag being searched for
   * @returns imageTag item
   * @throws error if query fails
   */
  imageTag.get = async (id) => {
    try {
      let item = await imageTag.findOne({
        where: {
          id: id
        }
      });
      
      if (item) return item;
  
      throw {
        status: httpStatus.NOT_FOUND,
        message: `imageTag, ${id}, deleted or does not exist.`
      };
    } catch (error) {
      throw error;
    }
  };

  return imageTag;
};