"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const restaurant_1 = __importDefault(require("../models/restaurant"));
const getRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantId = req.params.restaurantId;
        const restaurant = yield restaurant_1.default.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
const searchRestaurant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = req.params.city;
        const searchQuery = req.query.searchQuery || "";
        const selectedCuisines = req.query.selectedCuisines || "";
        const sortOption = req.query.sortOption || "lastUpdated";
        const page = parseInt(req.query.page, 10) || 1;
        let query = {};
        // Add city matching
        query["city"] = new RegExp(city, "i");
        // Check if there are restaurants in the city
        const cityCheck = yield restaurant_1.default.countDocuments(query);
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
        const restaurants = yield restaurant_1.default.find(query)
            .sort({ [sortOption]: 1 })
            .skip(skip)
            .limit(pageSize)
            .lean();
        const total = yield restaurant_1.default.countDocuments(query);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.default = {
    getRestaurant,
    searchRestaurant,
};
