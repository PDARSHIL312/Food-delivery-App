import { Request, Response } from "express";
import Restaurant from "../models/restaurant";

interface RestaurantQuery {
  city?: RegExp;
  cuisines?: { $all: string[] }; // Array of strings (not RegExp)
  $or?: { restaurantName: RegExp }[];
}

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string, 10) || 1;

    let query: RestaurantQuery = {};

    // Add city matching
    query["city"] = new RegExp(city, "i");

    // Check if there are restaurants in the city
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    // Handle cuisines filtering if provided
    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => cuisine.trim()); // Array of cuisines as strings

      query["cuisines"] = { $all: cuisinesArray }; // Match all cuisines
    }

    // Handle search query for restaurantName and cuisines
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        // { cuisines: { $in: [searchRegex] } }, // Match cuisines for the search query
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Fetch restaurants matching the query
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    // Prepare pagination response
    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getRestaurant,
  searchRestaurant,
};
