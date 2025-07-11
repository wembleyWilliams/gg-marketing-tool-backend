import { createVCard, deleteVCard, getVCard, updateVCard } from "../index";
import express from "express";

const utility = express.Router();

/**
 * @route DELETE /contact-card/delete
 * @desc Deletes a vCard by owner ID
 * @body { ownerId: string } - ID of the owner whose vCard should be deleted
 * @access Authenticated (or Admin)
 */
utility.delete('/contact-card/delete', deleteVCard);

/**
 * @route POST /contact-card/create
 * @desc Creates a new virtual contact card (vCard)
 * @body VCardData - All necessary fields for a vCard
 * @access Public or Authenticated
 */
utility.post('/contact-card/create', createVCard);

/**
 * @route PUT /contact-card/update
 * @desc Updates an existing vCard by owner ID
 * @body { ownerId: string, ...fields } - ID and updated fields for the vCard
 * @access Authenticated
 */
utility.put('/contact-card/update', updateVCard);

/**
 * @route POST /contact-card
 * @desc Generates and returns a downloadable vCard file based on business/card ID hash
 * @body { businessId: string } - The hash or ID used to locate the card
 * @access Public
 */
utility.post('/contact-card', getVCard);

export default utility;
