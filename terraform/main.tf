terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-2"
}

# manage secret metadata
resource "aws_secretsmanager_secret" "bill_payer_config_values" {
  name = "bill_payer_config_values"
  description = "list of values needed to checkout as guest on neld.net"
}

# manage secret value
resource "aws_secretsmanager_secret_version" "payment_details" {
  secret_id     = aws_secretsmanager_secret.bill_payer_config_values.id
  secret_string = jsonencode({
    electricAccountNumber = "<redacted>"
    cableAccountNumber = "<redacted>"
    address1 = "<redacted>"
    address2 = "<redacted>"
    city = "<redacted>"
    state = "<redacted>"
    zip = "<redacted>"
    phone = "<redacted>"
    email = "<redacted>"
    bankAccountNumber = "<redacted>"
    routingNumber = "<redacted>"
  })
  # secret_binary = jsonencode({
  #   bankAccountNumber = base64encode("<redacted>")
  #   routingNumber = base64encode("<redacted>")
  # })
}