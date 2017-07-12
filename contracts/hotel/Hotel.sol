pragma solidity ^0.4.11;

import "../Indexed.sol";
import "../Father.sol";

/*
 * Hotel
 * An indexed contract on the WT Index taht contains the hotel information and
 * the addresses of his Unit Types contracts.
 */
contract Hotel is Indexed, Father {

	// Main information
	string public name;
	string public description;
  uint public created;

	// Address and Location
	string public lineOne;
	string public lineTwo;
	string public zip;
	string public country;
	uint public timezone;
	uint public latitude;
	uint public longitude;

	// The units that the hotel have for rent.
	mapping(bytes32 => address) public unitTypes;
	bytes32[] public unitTypeNames;

<<<<<<< 47d1fd370838149601d09706710d8ef54fa1e9a4:contracts/hotel/Hotel.sol
  // Hotel images
	string[] public images;

  // Constructor

	function Hotel(string _name, string _description) {
=======
  // Constructor

	function WTHotel(string _name, string _description) {
>>>>>>> Update wt-contracts submodule and build:contracts/WTHotel.sol
		name = _name;
		description = _description;
		created = block.number;
		unitTypeNames.length ++;
	}

  // Owner methods

	function editInfo(
    string _name,
    string _description
  ) throughIndex() onlyOwner() {
		name = _name;
		description = _description;
	}

	function editAddress(
    string _lineOne,
    string _lineTwo,
    string _zip,
    string _country
  ) throughIndex() onlyOwner() {
		lineOne = _lineOne;
		lineTwo = _lineTwo;
		zip = _zip;
		country = _country;
	}

	function editLocation(
    uint _timezone,
    uint _longitude,
    uint _latitude
  ) throughIndex() onlyOwner() {
		timezone = _timezone;
		latitude = _latitude;
		longitude = _longitude;
	}

	function addUnitType(
    address addr,
    bytes32 unitType
  ) throughIndex() onlyOwner() {
		if (unitTypes[unitType] != address(0))
			throw;
		unitTypes[unitType] = addr;
		unitTypeNames.push(unitType);
    addChild(addr);
	}

  function addImage(string url) throughIndex() onlyOwner() {
		images.push(url);
	}

  function removeImage(uint index) throughIndex() onlyOwner() {
		delete images[index];
	}

	function removeUnitType(
    bytes32 unitType,
    uint index
  ) throughIndex() onlyOwner() {
		if (
      (unitTypes[unitType] == address(0)) ||
      (unitTypeNames[index] != unitType)
    )
			throw;
    removeChild(unitTypes[unitType]);
		delete unitTypes[unitType];
		delete unitTypeNames[index];
	}

	function changeUnitType(
    bytes32 unitType,
    address newAddr
  ) throughIndex() onlyOwner() {
		if (unitTypes[unitType] == address(0))
			throw;
    removeChild(unitTypes[unitType]);
		unitTypes[unitType] = newAddr;
    addChild(newAddr);
	}

	function callUnitType(
    bytes32 unitType,
    bytes data
  ) throughIndex() onlyOwner() {
		if (unitTypes[unitType] == address(0))
			throw;
		if (!unitTypes[unitType].call(data))
			throw;
	}

<<<<<<< 47d1fd370838149601d09706710d8ef54fa1e9a4:contracts/hotel/Hotel.sol
  // Only child methods

  function callIndex(bytes data) onlyChild() {
    if (!index.call(data))
      throw;
  }

	// Public methods
=======
	// Public constant methods
>>>>>>> Update wt-contracts submodule and build:contracts/WTHotel.sol

	function getUnitType(bytes32 unitType) constant returns (address) {
		return unitTypes[unitType];
	}

  function getUnitTypeNames() constant returns (bytes32[]) {
		return unitTypeNames;
	}

  function getImage(uint i) constant returns (string) {
		return images[i];
	}

  function getImagesLength() constant returns (uint) {
		return images.length;
	}

}
