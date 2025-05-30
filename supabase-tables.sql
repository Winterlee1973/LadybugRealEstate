-- Create the properties table
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" numeric(3, 1) NOT NULL,
	"square_footage" integer NOT NULL,
	"lot_size" text,
	"year_built" integer,
	"property_type" text NOT NULL,
	"status" text DEFAULT 'for_sale' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"hoa_fees" numeric(8, 2),
	"property_tax" numeric(10, 2),
	"agent_name" text,
	"agent_phone" text,
	"agent_email" text,
	"agent_photo" text,
	"agent_rating" numeric(2, 1),
	"agent_reviews" integer,
	"user_id" uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to Supabase auth user
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_property_id_unique" UNIQUE("property_id")
);

-- Create the profiles table to store user roles and other profile information
CREATE TABLE "profiles" (
    "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "role" text DEFAULT 'buyer' NOT NULL, -- 'buyer' or 'seller'
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create the favorites table
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create the inquiries table
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"inquiry_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);