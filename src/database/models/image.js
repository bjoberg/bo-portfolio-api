'use strict';

const httpStatus = require('http-status');
const { IMAGES, LIMIT_DEFAULT, PAGE_DEFAULT, SORT } = require('../../utils/models/defaults');
const omitBy = require('lodash').omitBy;
const isNil = require('lodash').isNil;
const Op = require('sequelize').Op;

module.exports = (sequelize, DataTypes) => {
  const image = sequelize.define('image', {
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
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
        notEmpty: true
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING(1234),
    },
    location: {
      type: DataTypes.STRING,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    captureDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {});

  image.associate = function (models) {
    image.belongsToMany(models.group, {
      through: models.imageGroup,
      foreignKey: 'imageId'
    });

    image.belongsToMany(models.tag, {
      through: models.imageTag,
      foreignKey: 'imageId'
    });
  };

  /**
   * Get the where clause for image model
   * 
   * @param {any} filter object with properties to query with
   * @returns object defining where clause for image model
   */
  const getWhere = (filter) => {
    const { thumbnailUrl, imageUrl, title, description, location, captureDate } = filter;
    const where = omitBy({ thumbnailUrl, imageUrl, title, description, location, captureDate }, isNil);
    return where;
  }

  /**
   * Get all of the images that match a certain query
   * 
   * @param {number} limit number of items to return
   * @param {number} offset range of items to return
   * @param {object} filter object with properties to query with
   * @param {string[]} sort sort order array (EX: [sortField, sortDirection])
   * @returns list of images
   * @throws error if query fails
   */
  image.list = async (
    limit = LIMIT_DEFAULT,
    offset = PAGE_DEFAULT,
    filter = {},
    sort = [IMAGES.DEFAULT_SORT_FIELD, IMAGES.DEFAULT_SORT_DIRECTION]) => {
    try {
      const where = getWhere(filter);
      const secondarySort = ["title", SORT.ASCENDING]
      const order = [sort, secondarySort];
      const options = { where, limit, offset, order };
      const data = await image.findAndCountAll(options);
      return {
        sort: {
          sortField: sort[0],
          sortDirection: sort[1]
        },
        data
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get all of the images in a specific group that match a certain query
   * 
   * @param {string} groupId unique id of group to search for
   * @param {any} groupModel sequelize model to query on
   * @param {number} limit number of items to return
   * @param {number} offset range of items to return
   * @param {Object} filter object with properties to query with
   * @param {string[]} sort sort order array (EX: [sortField, sortDirection])
   * @returns all of the images in a specific group containing the specified query items
   * @throws error if query fails
   */
  image.listImagesForGroup = async (
    groupId,
    groupModel,
    limit = LIMIT_DEFAULT,
    offset = PAGE_DEFAULT,
    filter = {},
    sort = [IMAGES.DEFAULT_SORT_FIELD, IMAGES.DEFAULT_SORT_DIRECTION]) => {
    try {
      const where = getWhere(filter);
      const secondarySort = ["title", SORT.ASCENDING]
      const order = [sort, secondarySort];
      const include = [{
        model: groupModel,
        attributes: [],
        where: {
          id: groupId
        }
      }];
      const options = { limit, offset, where, include, order };

      const data = await image.findAndCountAll(options);

      return {
        sort: {
          sortField: sort[0],
          sortDirection: sort[1]
        },
        data
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get all of the images not associated with a specific group that matches a certain query
   * 
   * @param {string} groupId unique id of group to find images not associated with
   * @param {number} limit number of items to return
   * @param {number} offset range of items to return
   * @param {Object} filter object with properties to query with
   * @param {string[]} sort sort order array (EX: [sortField, sortDirection])
   * @returns all of the images not associated with a specific group containing the specified query items
   * @throws error if query fails
   */
  image.listImagesNotForGroup = async (
    groupId,
    limit = LIMIT_DEFAULT,
    offset = PAGE_DEFAULT,
    filter = {},
    sort = [IMAGES.DEFAULT_SORT_FIELD, IMAGES.DEFAULT_SORT_DIRECTION]) => {
    try {
      const innerJoin = `(SELECT "imageId" FROM images as i JOIN public."imageGroups" as ig ON i.id = ig."imageId" JOIN public."groups" as g ON ig."groupId" = g.id WHERE ig."groupId" = '${groupId}')`;
      const where = {
        ...getWhere(filter),
        id: {
          [Op.notIn]: sequelize.literal(innerJoin)
        }
      };
      const order = [sort];
      const options = { limit, offset, where, order };

      const data = await image.findAndCountAll(options);

      return {
        sort: {
          sortField: sort[0],
          sortDirection: sort[1]
        },
        data
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Try and find an image by its id.
   * 
   * @param {string} id of the image being searched for
   * @returns image item
   * @throws error if query fails
   */
  image.get = async (id) => {
    try {
      const where = { id };
      const options = { where };
      return image.findOne(options);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Try and find an image in a group
   * 
   * @param {string} groupId unique id of group to search for
   * @param {string} imageId unique id of image to search for
   * @param {any} groupModel sequelize model to query on
   * @returns image item
   * @throws error if query fails
   */
  image.getImageGroup = async (groupId, imageId, groupModel) => {
    try {
      const where = { id: imageId };
      const include = [{
        model: groupModel,
        attributes: [],
        where: {
          id: groupId
        }
      }];
      const options = { where, include };
      return image.findOne(options);
    } catch (error) {
      throw error;
    }
  };

  return image;
};