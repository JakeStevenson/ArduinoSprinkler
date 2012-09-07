/*
 * My simple http-based sprinkler control
 * 4-zones on sprinkler correspond to pins 4-7
 * Because of my relay-- a LOW signal to the pin actually turns ON the sprinkler,
 *   so ON/OFF might be backward of what is expected
 */


#include <WiServer.h>

#define WIRELESS_MODE_INFRA	1
#define WIRELESS_MODE_ADHOC	2

// Wireless configuration parameters ----------------------------------------
unsigned char local_ip[] = {
  192,168,1,237};	// IP address of WiShield
unsigned char gateway_ip[] = {
  192,168,1,1};	// router or gateway IP address
unsigned char subnet_mask[] = {
  255,255,255,0};	// subnet mask for the local network
const prog_char ssid[] PROGMEM = {
  "REDACTED"};		// max 32 bytes

unsigned char security_type = 3;	// 0 - open; 1 - WEP; 2 - WPA; 3 - WPA2

// WPA/WPA2 passphrase
const prog_char security_passphrase[] PROGMEM = {
  "REDACTED"};	// max 64 characters

// WEP 128-bit keys
// sample HEX keys
prog_uchar wep_keys[] PROGMEM = { 
  0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,	// Key 0
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,	// Key 1
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,	// Key 2
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00	// Key 3
};

// setup the wireless mode
// infrastructure - connect to AP
// adhoc - connect to another WiFi device
unsigned char wireless_mode = WIRELESS_MODE_INFRA;

unsigned char ssid_len;
unsigned char security_passphrase_len;
// End of wireless configuration parameters ----------------------------------------


// This is our page serving function that generates web pages
boolean sendMyPage(char* URL) {
    char *zone = strtok(URL,"/");
    char *value = strtok(NULL,"/");
    int selectedPin = atoi (zone)+3; //Our zones are 1-4, but on pins 4-7
    
    if(value!=NULL)
    {
      pinMode(selectedPin, OUTPUT);
      if(strncmp(value, "OFF", 4) == 0 || strncmp(value, "ON", 3) == 0)
      {
        //Digial HIGH/LOW
        if(strncmp(value, "OFF", 4) == 0)
        {
          digitalWrite(selectedPin, HIGH);
        }
        if(strncmp(value, "ON", 4) == 0)
        {
          digitalWrite(selectedPin, LOW);
        }
      }
      WiServer.print("OK");
    }
    else
    {
      if(strncmp(zone, "ALL", 4) == 0)
      {
        WiServer.print('[');
        for(int checkPin = 4; checkPin < 7; checkPin++)
          {
            jsonPin(checkPin);
            WiServer.print("],[");
          }
        jsonPin(7);
        WiServer.print(']');
      }
      else
      {
        jsonPin(selectedPin);
      }
    }

    // URL was recognized
    return true;
  //}
  // URL not found
  //return false;
}

void jsonPin(int selectedPin)
{
  int zone = selectedPin-3;
  WiServer.print("{'zone");
  WiServer.print(zone);
  WiServer.print("':");
  readPin(selectedPin);
  WiServer.print('}');
}

void readPin(int selectedPin)
{
  //Send back single value
  pinMode(selectedPin, INPUT);
  int inValue = digitalRead(selectedPin);

  if(inValue == 0){
    WiServer.print("1");
  }

  if(inValue == 1){
    WiServer.print("0");
  }
}

void setup() {
  for(int selectedPin = 4; selectedPin <= 7; selectedPin++) 
  {
    pinMode(selectedPin, OUTPUT);
    digitalWrite(selectedPin, HIGH);
  }
  // Initialize WiServer and have it use the sendMyPage function to serve pages
  WiServer.init(sendMyPage);

  // Enable Serial output and ask WiServer to generate log messages (optional)
  Serial.begin(57600);
  WiServer.enableVerboseMode(true);
}

void loop(){

  // Run WiServer
  WiServer.server_task();

  delay(10);
}


