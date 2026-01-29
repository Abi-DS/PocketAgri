import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  ////////////////////////
  // Type Declarations  //
  ////////////////////////

  public type UserProfile = {
    name : Text;
    email : ?Text;
    farmName : ?Text;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
  };

  type Field = {
    id : Nat;
    owner : Principal;
    name : Text;
    location : Location;
    notes : Text;
    weatherData : ?Text;
    soilData : ?Text;
  };

  type CropPrediction = {
    id : Nat;
    fieldId : Nat;
    crop : Text;
    suitabilityScore : Nat;
    recommendations : Text;
    timestamp : Time.Time;
  };

  type DiseaseScan = {
    id : Nat;
    fieldId : Nat;
    plantType : Text;
    image : Storage.ExternalBlob;
    disease : ?Text;
    severity : ?Text;
    timestamp : Time.Time;
  };

  type ChatMessage = {
    id : Nat;
    userId : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  type UserPreferences = {
    preferredLanguage : Text;
    measurementUnits : Text;
  };

  module CropPrediction {
    public func compare(a : CropPrediction, b : CropPrediction) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Field {
    public func compare(a : Field, b : Field) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module DiseaseScan {
    public func compare(a : DiseaseScan, b : DiseaseScan) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  /////////////////
  // Counters    //
  /////////////////

  var fieldCounter = 0;
  var predictionCounter = 0;
  var scanCounter = 0;
  var chatCounter = 0;

  /////////////////
  // State       //
  /////////////////

  let fields = Map.empty<Nat, Field>();
  let predictions = Map.empty<Nat, CropPrediction>();
  let diseaseScans = Map.empty<Nat, DiseaseScan>();
  let chatHistory = Map.empty<Nat, ChatMessage>();
  let userPreferences = Map.empty<Principal, UserPreferences>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  //////////////////////////////////////////
  // Authorization System Initialization  //
  //////////////////////////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /////////////////////////
  // User Profile Functions
  /////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /////////////////////
  // Field Functions //
  /////////////////////

  public shared ({ caller }) func addField(name : Text, loc : Location, notes : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add fields");
    };
    fieldCounter += 1;
    let field : Field = {
      id = fieldCounter;
      owner = caller;
      name;
      location = loc;
      notes;
      weatherData = null;
      soilData = null;
    };
    fields.add(field.id, field);
    field.id;
  };

  public query ({ caller }) func getFieldsByUser(userId : Principal) : async [Field] {
    // Users can only view their own fields, admins can view any user's fields
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own fields");
    };
    fields.values().toArray().filter(
      func(f) { f.owner == userId }
    );
  };

  public query ({ caller }) func getField(fieldId : Nat) : async Field {
    let field = switch (fields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?field) { field };
    };

    // Only the owner or admin can view a field
    if (field.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own fields");
    };

    field;
  };

  //////////////
  // Weather  //
  //////////////

  public shared ({ caller }) func updateWeatherData(fieldId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify weather data");
    };

    let field = switch (fields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?f) { f };
    };

    // Only the owner can update weather data for their field
    if (field.owner != caller) {
      Runtime.trap("Unauthorized: Can only update weather data for your own fields");
    };

    // Simulate weather API call (would be actual outcall in production)
    let updatedField = {
      id = field.id;
      owner = field.owner;
      name = field.name;
      location = field.location;
      notes = field.notes;
      weatherData = ?"Sunny, 25°C";
      soilData = field.soilData;
    };
    fields.add(fieldId, updatedField);
  };

  ///////////////
  // Predictions
  ///////////////

  public shared ({ caller }) func makePrediction(fieldId : Nat, crop : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can make predictions");
    };

    let field = switch (fields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?f) { f };
    };

    // Only the owner can make predictions for their field
    if (field.owner != caller) {
      Runtime.trap("Unauthorized: Can only make predictions for your own fields");
    };

    predictionCounter += 1;
    let prediction : CropPrediction = {
      id = predictionCounter;
      fieldId;
      crop;
      suitabilityScore = 80; // Simulated score
      recommendations = "Plant in early spring";
      timestamp = Time.now();
    };

    predictions.add(prediction.id, prediction);
    prediction.id;
  };

  public query ({ caller }) func getPredictionsByField(fieldId : Nat) : async [CropPrediction] {
    let field = switch (fields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?f) { f };
    };

    // Only the owner or admin can view predictions for a field
    if (field.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view predictions for your own fields");
    };

    predictions.values().toArray().filter(
      func(p) { p.fieldId == fieldId }
    ).sort();
  };

  ////////////
  // Disease Scans
  ////////////

  public shared ({ caller }) func uploadScan(fieldId : Nat, plantType : Text, image : Storage.ExternalBlob) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload scans");
    };

    let field = switch (fields.get(fieldId)) {
      case (null) { Runtime.trap("Field not found") };
      case (?f) { f };
    };

    // Only the owner can upload scans for their field
    if (field.owner != caller) {
      Runtime.trap("Unauthorized: Can only upload scans for your own fields");
    };

    // Would normally send image to ML service here
    scanCounter += 1;
    let scan : DiseaseScan = {
      id = scanCounter;
      fieldId;
      plantType;
      image;
      disease = ?"No disease detected";
      severity = null;
      timestamp = Time.now();
    };

    diseaseScans.add(scan.id, scan);
    scan.id;
  };

  public query ({ caller }) func getDiseasesByUser(userId : Principal) : async [DiseaseScan] {
    // Users can only view their own scans, admins can view any user's scans
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own disease scans");
    };

    diseaseScans.values()
    .toArray()
    .filter(
      func(scan) {
        switch (fields.get(scan.fieldId)) {
          case (null) { false };
          case (?f) { f.owner == userId };
        };
      }
    ).sort();
  };

  ////////////
  // Chatbot
  ////////////

  public shared ({ caller }) func sendMessage(message : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    chatCounter += 1;
    let chat : ChatMessage = {
      id = chatCounter;
      userId = caller;
      message;
      timestamp = Time.now();
    };
    chatHistory.add(chat.id, chat);
    chat.id;
  };

  public query ({ caller }) func getChatHistory(userId : Principal) : async [ChatMessage] {
    // Users can only view their own chat history, admins can view any user's history
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own chat history");
    };

    chatHistory.values()
    .toArray()
    .filter(
      func(msg) { msg.userId == userId }
    );
  };

  /////////////////
  // Preferences
  /////////////////
  public shared ({ caller }) func savePreferences(preferences : UserPreferences) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify preferences");
    };
    userPreferences.add(caller, preferences);
  };

  public query ({ caller }) func getPreferences() : async ?UserPreferences {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view preferences");
    };
    userPreferences.get(caller);
  };

  ////////////
  // Queries
  ////////////

  public query ({ caller }) func getAllFields() : async [Field] {
    // Only admins can view all fields
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all fields");
    };
    fields.values().toArray().sort();
  };

  public query ({ caller }) func getAllPredictions() : async [CropPrediction] {
    // Only admins can view all predictions
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all predictions");
    };
    predictions.values().toArray().sort();
  };

  //////////////////////////////
  // HTTP Outcall Example     //
  //////////////////////////////

  public query ({ caller }) func weatherTransform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchWeatherData(location : Text) : async ?Text {
    // Any authenticated user can fetch weather data
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch weather data");
    };

    let apiUrl = "https://api.open-meteo.com/v1/forecast?location=" # location;

    let response = try {
      await OutCall.httpGetRequest(apiUrl, [], weatherTransform);
    } catch (e) {
      return null;
    };

    // Directly return the raw JSON response to the frontend
    ?response;
  };
};
